import {
  AddFave,
  AddThing,
  BroadcastNotif,
  GetUser,
  SendAdminNotif,
  SendFaveNotif,
  TestNotif,
  UpdateUser,
} from '@app/common/Api';
import {Fave, Profile, Thing} from '@app/common/DataTypes';
import {NOTIF_CHANNELS} from '@app/common/NotifChannels';
import {User, UserRoles} from '@toolkit/core/api/User';
import {CodedError} from '@toolkit/core/util/CodedError';
import {Updater, useDataStore} from '@toolkit/data/DataStore';
import {
  requireAccountInfo,
  requireLoggedInUser,
  setAccountToUserCallback,
} from '@toolkit/providers/firebase/server/Auth';
import {getFirebaseConfig} from '@toolkit/providers/firebase/server/Config';
import {registerHandler} from '@toolkit/providers/firebase/server/Handler';
import {
  apnsToFCMToken,
  getSender,
} from '@toolkit/providers/firebase/server/PushNotifications';
import {getAllowlistMatchedRoles} from '@toolkit/providers/firebase/server/Roles';
import {PushToken} from '@toolkit/services/notifications/NotificationTypes';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {AuthData} from 'firebase-functions/lib/common/providers/https';
const {defineSecret} = require('firebase-functions/params');

const notificationApiKey = defineSecret('fcm_server_key');

function newProfileFor(user: Updater<User>): Updater<Profile> {
  const id = user.id!;
  return {
    id,
    user: {id},
    name: user.name,
    ...(user.pic && {pic: user.pic}),
  };
}

function addDerivedFields(user: User) {
  user.canLogin = true;
}

/**
 * Convert Firebase Auth account to User
 */
async function accountToUser(auth: AuthData): Promise<User> {
  // TODO: Make `firestore` role-based (e.g. firestoreForRole('ACCOUNT_CREATOR'))
  // @ts-ignore
  const userStore = useDataStore(User);
  const profileStore = useDataStore(Profile);
  const userId = auth.uid;

  let [user, profile] = await Promise.all([
    userStore.get(userId, {edges: [UserRoles]}),
    profileStore.get(userId),
  ]);
  const roles = await getAllowlistMatchedRoles(auth);
  if (user != null && profile != null) {
    if (!user.roles) {
      user.roles = {id: user.id, roles: []};
    }
    user.roles.roles = user.roles.roles ?? [];
    user.roles.roles.push(...roles);
    addDerivedFields(user);
    functions.logger.debug(user, roles);
    return user;
  }

  // TODO: Potentially fix this logic
  // If the user matches any role, make them a user.
  if (roles.length === 0) {
    throw new CodedError('AUTH.ERROR', 'You are not in allowlist');
  }

  const firebaseAccount = auth.token!;

  const name =
    firebaseAccount.displayName ||
    firebaseAccount.email ||
    firebaseAccount.phoneNumber ||
    'No Name';

  const newUser: User = {
    id: auth.uid,
    name,
    pic: firebaseAccount.picture || undefined,
    email: firebaseAccount.email || undefined,
  };

  const newProfile = newProfileFor(newUser);

  // We have an example of doing these in a transaction (in server code)
  // but for simplicity, will make separate calls.
  if (user == null) {
    user = await userStore.create(newUser);
    addDerivedFields(user);
  }

  if (profile == null) {
    await profileStore.create(newProfile);
  }

  // TODO: Explicit set to admin mode for users, profiles, roles,
  // and
  const roleStore = useDataStore(UserRoles);

  // TODO: Re-enable transaction if we have a clean way of supporting
  await userStore.create({...newUser, roles: {id: newUser.id}});
  await profileStore.create(newProfile);
  await roleStore.create({roles, id: newUser.id});

  const createdUser = await userStore.get(newUser.id, {edges: [UserRoles]});
  addDerivedFields(createdUser!);
  return createdUser!;
}
setAccountToUserCallback(accountToUser);

async function convertPushTokenImpl(pushToken: PushToken) {
  if (pushToken.type !== 'ios') {
    return;
  }

  const apnsToken = pushToken.token;
  functions.logger.debug('Converting token: ', apnsToken);
  const fcmTokenResp = Object.values(
    await apnsToFCMToken(
      pushToken.sandbox
        ? 'com.npetoolkit.favezilla'
        : 'com.npetoolkit.favezilla',

      notificationApiKey.value(),
      [apnsToken],
      pushToken.sandbox,
    ),
  );
  if (fcmTokenResp.length !== 1) {
    throw new Error('Unexpected response when converting APNs token to FCM');
  }
  const fcmToken = fcmTokenResp[0];
  return fcmToken;
}

/**
 * Send a test notification to the device associated with the
 * push token passed in. This is the simplest "lights-on" test that
 * notifications is working - if this fails then there are likely
 * configuration issues.
 *
 * TODO: Add link to notification setup docs
 */
export const testNotif = registerHandler(
  TestNotif,
  async (pushToken: PushToken) => {
    const fcm = await convertPushTokenImpl(pushToken);
    if (!fcm) {
      return;
    }
    functions.logger.debug('Got FCM Token: ', fcm);
    const payload = {
      notification: {title: 'Ahoy!', body: 'We have contact 🚀'},
    };
    const resp = await admin.messaging().sendToDevice(fcm, payload);
    functions.logger.debug(resp.results[0]);
  },
  {secrets: [notificationApiKey]},
);

export const convertPushToken = functions
  .runWith({secrets: [notificationApiKey]})
  .firestore.document('instance/favezilla/push_tokens/{token}')
  .onCreate(async (change, context) => {
    if (change.get('type') !== 'ios') {
      return;
    }

    const apnsToken = change.get('token');
    const fcmTokenResp = Object.values(
      await apnsToFCMToken(
        change.get('sandbox')
          ? 'com.npetoolkit.favezilla'
          : 'com.npetoolkit.favezilla',
        notificationApiKey.value(),
        [apnsToken],
        change.get('sandbox'),
      ),
    );
    if (fcmTokenResp.length !== 1) {
      throw new Error('Unexpected response when converting APNs token to FCM');
    }
    const fcmToken = fcmTokenResp[0];

    return change.ref.set({fcmToken}, {merge: true});
  });

export const sendFaveNotif = registerHandler(
  SendFaveNotif,
  async ({thingId}) => {
    const user = requireLoggedInUser();
    const profileStore = useDataStore(Profile);
    const thingStore = useDataStore(Thing);

    const [thing, profile] = await Promise.all([
      thingStore.required(thingId, {edges: [Fave, [Fave, Profile, 1]]}),
      profileStore.required(user.id),
    ]);

    let toNotify = thing.faves.map(f => f.user.id).filter(id => id !== user.id);

    const send = getSender();
    await send(
      toNotify,
      NOTIF_CHANNELS.thingFaved,
      {},
      {likerName: profile.name, thingName: thing.name},
    );
  },
);

export const getUser = registerHandler(GetUser, async () => {
  const account = requireAccountInfo();
  const userStore = useDataStore(User);
  const user = await userStore.required(account.uid, {edges: [UserRoles]});
  addDerivedFields(user);
  return user;
});

export const updateUser = registerHandler(
  UpdateUser,
  async (values: Updater<User>) => {
    const user = requireLoggedInUser();
    const userStore = useDataStore(User);
    const profileStore = useDataStore(Profile);

    // This should be also checked by firestore rules so could remove
    if (values.id != user.id) {
      // TODO: coded typed error
      throw new Error('Not allowed');
    }

    // TODO: Reenable transaction
    const profileValues = newProfileFor(values);
    await userStore.update(values);
    await profileStore.update(profileValues);

    const updatedUser = await userStore.get(values.id);
    addDerivedFields(updatedUser!);
    return updatedUser!;
  },
);

export const addThing = registerHandler(AddThing, async data => {
  requireLoggedInUser();
  const thingStore = useDataStore(Thing);
  const newFave = await thingStore.create(data);
  return newFave.id;
});

export const addFave = registerHandler(AddFave, async (thingId: string) => {
  const uid = requireLoggedInUser().id;
  const userStore = useDataStore(User);
  const thingStore = useDataStore(Thing);
  const faveStore = useDataStore(Fave);

  // This should never be undefined because of the call to requireLoggedInUser
  const user = (await userStore.get(uid, {edges: [Thing]}))!;

  // Make sure the thing exists
  const thing = await thingStore.get(thingId);
  if (!thing) {
    // TODO: Throw coded error
    throw Error(`Thing with ID ${thingId} does not exist`);
  }

  // Check if this fave already exists
  const existing = await faveStore.query({
    where: [
      {field: 'user', op: '==', value: uid},
      {field: 'thing', op: '==', value: thingId},
    ],
  });
  if (existing.length > 0) {
    return existing[0];
  }

  // Create a fave
  const fave = await faveStore.create({
    user,
    thing,
  });

  return fave;
});

export const sendAdminNotif = registerHandler(
  SendAdminNotif,
  async ({user, title, body}) => {
    functions.logger.debug('<<<HELLO!>>>');
    const channel = NOTIF_CHANNELS.admin;
    const send = getSender();
    await send(user.id, channel, {title: title != null ? title : ''}, {body});
  },
  {allowedRoles: ['admin']},
);

export const broadcastNotif = registerHandler(
  BroadcastNotif,
  async ({title = '', body}) => {
    const channel = NOTIF_CHANNELS.admin;
    // TODO: Set this handler to admin privileges
    const userStore = await useDataStore(User);
    const allUsers = await userStore.getAll();
    const send = getSender();

    await Promise.all(
      allUsers.map(user => send(user.id, channel, {title}, {body})),
    );
  },
  {allowedRoles: ['admin']},
);
