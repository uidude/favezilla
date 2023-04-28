import {
  AddFave,
  AddThing,
  BroadcastAdminNotif,
  GetUser,
  SendAdminNotif,
  SendFaveNotif,
  SendThingDeleteNotif,
  UpdateUser,
} from '@app/common/Api';
import {Fave, Profile, Thing} from '@app/common/DataTypes';
import {NOTIF_CHANNELS} from '@app/common/NotifChannels';
import {User, UserRoles} from '@toolkit/core/api/User';
import {CodedError} from '@toolkit/core/util/CodedError';
import {Updater, getRequired} from '@toolkit/data/DataStore';
import {firebaseStore} from '@toolkit/providers/firebase/DataStore';
import {
  requireAccountInfo,
  requireLoggedInUser,
  setAccountToUserCallback,
} from '@toolkit/providers/firebase/server/Auth';
import {getFirebaseConfig} from '@toolkit/providers/firebase/server/Config';
import {
  getAdminDataStore,
  getDataStore,
} from '@toolkit/providers/firebase/server/Firestore';
import {registerHandler} from '@toolkit/providers/firebase/server/Handler';
import {
  apnsToFCMToken,
  getSender,
} from '@toolkit/providers/firebase/server/PushNotifications';
import {getAllowlistMatchedRoles} from '@toolkit/providers/firebase/server/Roles';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {AuthData} from 'firebase-functions/lib/common/providers/https';

const firebaseConfig = getFirebaseConfig();

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
  const users = await getDataStore(User);
  const profiles = await getDataStore(Profile);
  const userId = auth.uid;

  let [user, profile] = await Promise.all([
    users.get(userId, {edges: [UserRoles]}),
    profiles.get(userId),
  ]);
  if (user != null && profile != null) {
    addDerivedFields(user);
    return user;
  }

  // TODO: Potentially fix this logic
  // If the user matches any role, make them a user.
  const roles = await getAllowlistMatchedRoles(auth);
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
    user = await users.create(newUser);
    addDerivedFields(user);
  }

  if (profile == null) {
    await profiles.create(newProfile);
  }

  //return user;

  const fs = admin.firestore();
  await fs.runTransaction(async (txn: any) => {
    // @ts-ignore: hack to pass in `transaction`
    const userStoreInTxn = firebaseStore(User, fs, txn, firebaseConfig);
    // @ts-ignore: ditto
    const profileStoreInTxn = firebaseStore(Profile, fs, txn, firebaseConfig);
    // @ts-ignore: ditto
    const rolesStoreInTxn = firebaseStore(UserRoles, fs, txn, firebaseConfig);

    userStoreInTxn.create({...newUser, roles: {id: newUser.id}});
    profileStoreInTxn.create(newProfile);
    rolesStoreInTxn.create({roles, id: newUser.id});
  });

  const createdUser = await users.get(newUser.id, {edges: [UserRoles]});
  addDerivedFields(createdUser!);
  return createdUser!;
}
setAccountToUserCallback(accountToUser);

export const convertPushToken = functions.firestore
  .document('instance/haxapp/push_tokens/{token}')
  .onCreate(async (change, context) => {
    if (change.get('type') !== 'ios') {
      return;
    }

    const apnsToken = change.get('token');
    functions.logger.debug('Converting token: ', apnsToken);
    const fcmTokenResp = Object.values(
      await apnsToFCMToken(
        change.get('sandbox')
          ? 'com.facebook.npe.favezilla.localDevelopment'
          : 'com.facebook.npe.favezilla',
        functions.config().fcm.server_key,
        [apnsToken],
        change.get('sandbox'),
      ),
    );
    if (fcmTokenResp.length !== 1) {
      throw new Error('Unexpected response when converting APNs token to FCM');
    }
    const fcmToken = fcmTokenResp[0];
    functions.logger.debug('Got FCM Token: ', fcmToken);

    return change.ref.set({fcmToken}, {merge: true});
  });

export const sendFaveNotif = registerHandler(
  SendFaveNotif,
  async (fave: Fave) => {
    const user = requireLoggedInUser();
    const channel = NOTIF_CHANNELS.thingFaved;
    const send = getSender();
    await send(
      user.id,
      channel,
      {},
      {
        likerName: fave.user.name,
        thingName: fave.thing.name,
      },
    );
  },
);

export const sendThingDeleteNotif = registerHandler(
  SendThingDeleteNotif,
  async (thingName: string) => {
    const user = requireLoggedInUser();
    const channel = NOTIF_CHANNELS.thingDeleted;
    const send = getSender();
    await send(
      user.id,
      channel,
      {},
      {
        thingName,
      },
    );
  },
);

export const getUser = registerHandler(GetUser, async () => {
  const account = requireAccountInfo();
  const store = await getDataStore(User);
  const user = await getRequired(store, account.uid, {edges: [UserRoles]});
  addDerivedFields(user);
  return user;
});

export const updateUser = registerHandler(
  UpdateUser,
  async (values: Updater<User>) => {
    const user = requireLoggedInUser();
    // This should be also checked by firestore rules so could remove
    if (values.id != user.id) {
      // TODO: coded typed error
      throw new Error('Not allowed');
    }
    const fs = admin.firestore();
    await fs.runTransaction(async txn => {
      // @ts-ignore: hack to pass in `transaction`
      const userStoreInTxn = firebaseStore(User, fs, txn, firebaseConfig);
      // @ts-ignore: ditto
      const profileStoreInTxn = firebaseStore(Profile, fs, txn, firebaseConfig);
      const profileValues = newProfileFor(values);
      userStoreInTxn.update(values);
      profileStoreInTxn.update(profileValues);
    });
    const store = await getDataStore(User);
    const updatedUser = await store.get(values.id);
    addDerivedFields(updatedUser!);
    return updatedUser!;
  },
);

export const addThing = registerHandler(AddThing, async data => {
  requireLoggedInUser();
  const thingStore = await getDataStore(Thing);
  const newFave = await thingStore.create(data);
  return newFave.id;
});

export const addFave = registerHandler(AddFave, async (thingId: string) => {
  const uid = requireLoggedInUser().id;
  const userStore = await getDataStore(User);
  const thingStore = await getDataStore(Thing);
  const faveStore = await getDataStore(Fave);

  // This should never be undefined because of the call to requireLoggedInUser
  const user = (await userStore.get(uid, {edges: [Thing]}))!;

  // Make sure the thing exists
  const thing = await thingStore.get(thingId);
  if (!thing) {
    // TODO: Throw coded error
    throw Error(`Thing with ID ${thingId} does not exist`);
  }

  // Check if this fave already exists
  const existing = await faveStore.getMany({
    query: {
      where: [
        {field: 'user', op: '==', value: uid},
        {field: 'thing', op: '==', value: thingId},
      ],
    },
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
    const channel = NOTIF_CHANNELS.admin;
    const send = getSender();
    await send(user.id, channel, {title: title != null ? title : ''}, {body});
  },
  {allowedRoles: ['ADMIN']},
);

export const broadcastAdminNotif = registerHandler(
  BroadcastAdminNotif,
  async ({title = '', body}) => {
    const channel = NOTIF_CHANNELS.admin;
    const userStore = await getAdminDataStore(User);
    const allUsers = await userStore.getAll();
    const send = getSender();

    await Promise.all(
      allUsers.map(user => send(user.id, channel, {title}, {body})),
    );
  },
  {allowedRoles: ['ADMIN']},
);
