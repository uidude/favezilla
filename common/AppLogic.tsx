import {api} from '@toolkit/core/api/DataApi';
import {User, requireLoggedInUser} from '@toolkit/core/api/User';
import {Opt} from '@toolkit/core/util/Types';
import {Updater, useDataStore} from '@toolkit/data/DataStore';
import {Fave, Profile, Thing} from './DataTypes';

// Cilent business logic

/**
 * Get all of the things the app knows about
 */
export const GetThings = api<void, Thing[]>('things.get', () => {
  requireLoggedInUser<User>();
  const thingStore = useDataStore(Thing);

  return async function getAllThings() {
    const things = await thingStore.getAll();

    // Alphabetize
    things.sort((thing1, thing2) => thing1.name.localeCompare(thing2.name));

    return things;
  };
});

/**
 * Get all favorites for a user.
 */
export const GetFaves = api<void, Fave[]>('getFaves', () => {
  const user = requireLoggedInUser<User>();
  const faveStore = useDataStore(Fave);

  return async function getFaves() {
    return await faveStore.getMany({
      query: {
        where: [{field: 'user', op: '==', value: user.id}],
      },
      edges: [Thing],
    });
  };
});

/**
 * Add a new favorite to a given thingID.
 */
export function useAddFave() {
  const user = requireLoggedInUser<User>();
  const thingStore = useDataStore(Thing);
  const faveStore = useDataStore(Fave);

  return async (thingId: string) => {
    const thing = await thingStore.get(thingId);
    if (!thing) {
      throw Error(`Thing with ID ${thingId} does not exist`);
    }

    const existing = await faveStore.getMany({
      query: {
        where: [
          {field: 'user', op: '==', value: user.id!},
          {field: 'thing', op: '==', value: thingId},
        ],
      },
    });
    if (existing.length > 0) {
      return existing[0];
    }

    const fave = await faveStore.create({
      user,
      thing,
    });

    return (await faveStore.get(fave.id, {
      edges: [User, Fave],
    }))!;
  };
}

/**
 * Add a new thing
 */
export const AddThing = api<Updater<Thing>, string>('addThing', () => {
  requireLoggedInUser();
  const thingStore = useDataStore(Thing);
  return async (thing: Updater<Thing>) => {
    const result = await thingStore.create(thing);
    return result.id;
  };
});

/**
 * Delete a thing and associated faves
 */
export const RemoveThing = api<string, void>('removeThing', () => {
  const faveStore = useDataStore(Fave);
  const thingStore = useDataStore(Thing);

  return async function removeThing(thingId: string) {
    // Delete fave edgers
    const faves = await faveStore.getMany({
      query: {
        where: [{field: 'thing', op: '==', value: thingId}],
      },
    });
    const faveDeletes = faves.map(fave => faveStore.remove(fave.id));
    await Promise.all(faveDeletes);

    // Delete the thing itself
    await thingStore.remove(thingId);
  };
});

function newProfileFor(user: User): Partial<Profile> {
  return {
    id: user.id,
    user: user,
    name: user.name,
    ...(user.pic && {pic: user.pic}),
  };
}

function addDerivedFields(user: User) {
  user.canLogin = true;
  if (user.name === '') {
    user.canLogin = false;
    user.cantLoginReason = 'onboarding';
  }
}

export type LoginUserInfo = {
  uid: string;
  displayName: Opt<string>;
  email: Opt<string>;
  phoneNumber: Opt<string>;
  photoURL: Opt<string>;
};

/**
 * Client version of creating user - this is for early development,
 * should switch to a server-based version for launch
 */
export function useGetOrCreateUser() {
  const users = useDataStore(User);
  const profiles = useDataStore(Profile);

  return async (firebaseAccount: LoginUserInfo): Promise<User> => {
    const userId = firebaseAccount.uid;

    let [user, profile] = await Promise.all([
      users.get(userId),
      profiles.get(userId),
    ]);

    if (user != null && profile != null) {
      addDerivedFields(user);
      return user;
    }

    const initialName =
      firebaseAccount.displayName || firebaseAccount.email || '';

    const newUser: User = {
      id: userId,
      name: initialName,
      pic: firebaseAccount.photoURL || undefined,
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
      user.canLogin = false;
      user.cantLoginReason = 'onboarding';
    }

    return user;
  };
}

export function useUpdateUserAndProfile() {
  const userStore = useDataStore(User);
  const profileStore = useDataStore(Profile);

  return async function updateUserAndProfile(
    id: string,
    user: Partial<User>,
    profile: Partial<Profile>,
  ) {
    // Ensure user` has updated before updating profile
    await userStore.update({...user, id});

    const userFieldsToCopy = {
      name: user.name,
      ...(user.pic && {pic: user.pic}),
    };
    // TODO: Consider using transactions
    await profileStore.update({...profile, ...userFieldsToCopy, id});
  };
}
