import React from 'react';
import firebase from 'firebase';
import {Account} from '@toolkit/core/api/Auth';
import {useApi} from '@toolkit/core/api/DataApi';
import {useBackgroundStatus} from '@toolkit/core/client/Status';
import {FirebaseAuthService} from '@toolkit/providers/firebase/client/AuthService';
import {UnauthorizedError} from '@toolkit/tbd/CommonErrors';
import {GetUser} from '@app/common/Api';
import {LoginUserInfo} from '@app/common/AppLogic';

export default function AuthConfig(props: {children?: React.ReactNode}) {
  const getUser = useApi(GetUser);
  const {setError} = useBackgroundStatus();

  /**
   * Use this method to create an instance of your app's user when they log in.
   */
  const userCallback = async (
    account: Account,
    firebaseAccount: firebase.User,
  ) => {
    throwIfInvalidAccount(firebaseAccount, account.id);
    const loginInfo = loginFields(firebaseAccount);
    const user = await getUser(loginInfo);
    // If the user doesn't have roles set or if the user isn't an admin or dev, reject login
    if (
      user.roles == null ||
      !(user.roles.roles.includes('ADMIN') || user.roles.roles.includes('DEV'))
    ) {
      const err = UnauthorizedError(
        "User's roles do not match any allowed roles for this function",
      );
      setError(err);
      throw err;
    }

    return user;
  };

  return (
    <FirebaseAuthService userCallback={userCallback}>
      {props.children}
    </FirebaseAuthService>
  );
}

function throwIfInvalidAccount(
  firebaseAccount: firebase.User,
  expectedId: string,
) {
  if (
    firebaseAccount.uid !== expectedId ||
    (firebaseAccount.email == null && firebaseAccount.phoneNumber == null)
  ) {
    throw Error('Invalid account for login');
  }
}

function loginFields(firebaseAccount: firebase.User): LoginUserInfo {
  return {
    uid: firebaseAccount.uid,
    displayName: firebaseAccount.displayName,
    email: firebaseAccount.email,
    phoneNumber: firebaseAccount.phoneNumber,
    photoURL: firebaseAccount.photoURL,
  };
}
