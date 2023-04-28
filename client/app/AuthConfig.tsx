import React from 'react';
import firebase from 'firebase';
import {Account} from '@toolkit/core/api/Auth';
import {useApi} from '@toolkit/core/api/DataApi';
import {User} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {FirebaseAuthService} from '@toolkit/providers/firebase/client/AuthService';
import {GET_USER} from '@app/common/Api';
import {Profile} from '@app/common/DataTypes';

/**
 * For early development, it is convenient to create users on the client using Firestore APIs.
 *
 * For launch you'll need to switch this to true and use a server-side call.
 */
const CREATE_USERS_ON_SERVER = false;

export default function AuthConfig(props: {children?: React.ReactNode}) {
  const getUser = useApi(GET_USER);
  const getOrCreateUser = useGetOrCreateUser();

  /**
   * Use this method to create an instance of your app's user when they log in.
   */
  const userCallback = async (
    account: Account,
    firebaseAccount: firebase.User,
  ) => {
    if (
      firebaseAccount == null ||
      firebaseAccount.uid !== account.id ||
      (firebaseAccount.email == null && firebaseAccount.phoneNumber == null)
    ) {
      throw Error('Invalid account for login');
    }

    if (CREATE_USERS_ON_SERVER) {
      return await getUser();
    } else {
      return await getOrCreateUser(firebaseAccount);
    }
  };

  return (
    <FirebaseAuthService userCallback={userCallback}>
      {props.children}
    </FirebaseAuthService>
  );
}

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
}

/**
 * Client version of creating user - this is for early development,
 * should switch to a server-based version for launch
 */
function useGetOrCreateUser() {
  const users = useDataStore(User);
  const profiles = useDataStore(Profile);

  return async (firebaseAccount: firebase.User): Promise<User> => {
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
      firebaseAccount.displayName ||
      firebaseAccount.email ||
      firebaseAccount.phoneNumber ||
      'No Name';

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
    }

    return user;
  };
}
