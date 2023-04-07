/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {
  SimpleLoginScreenConfig,
  simpleLoginScreen,
} from '@toolkit/screens/login/LoginScreen';
import {Screen} from '@toolkit/ui/screen/Screen';

const LOGIN_SCREEN_CONFIG: SimpleLoginScreenConfig = {
  title: 'Favezilla',
  subtitle: 'Share your favorite books!\n(and soon other favorite things)',
  authTypes: ['google'],
  home: 'Favorites',
  tos: '*Terms of Service coming soon*',
};

const LoginScreen: Screen<{}> = simpleLoginScreen(LOGIN_SCREEN_CONFIG);
LoginScreen.style = {type: 'top', nav: 'none'};

export default LoginScreen;
