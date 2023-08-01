import React from 'react';
import {View} from 'react-native';
import {useAuth} from '@toolkit/core/api/Auth';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {actionHook} from '@toolkit/core/client/Action';
import Settings, {Setting} from '@toolkit/screens/Settings';
import {NotificationSettings} from '@toolkit/screens/settings/NotificationSettings';
import {navToAction, useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {OpenLinkAction, openUrlAction} from '@toolkit/ui/screen/WebScreen';
import {LEGAL_LINKS} from '@app/common/Config';
import About from '@app/screens/About';
import DevSettings from '@app/screens/DevSettings';
import EditProfile from './EditProfile';
import LoginScreen from './LoginScreen';
import Support from './Support';

const ABOUT = {
  icon: 'information-outline',
  label: 'About',
  to: About,
};

const SUPPORT = {
  icon: 'help-circle-outline',
  label: 'Support',
  to: Support,
};

const ACCOUNT = {
  icon: 'account-outline',
  label: 'Account',
  to: EditProfile,
};

const NOTIF_SETTINGS = {
  label: 'Notifications',
  icon: 'bell-ring-outline',
  to: NotificationSettings,
};

const DEV_SETTINGS = {
  id: 'DevSettings',
  label: 'Dev Settings',
  icon: 'wrench-outline',
  to: DevSettings,
};

export const LOGOUT_ACTION = {
  id: 'Logout',
  label: 'Log Out',
  icon: 'logout',
  action: actionHook(() => {
    const auth = useAuth();
    const nav = useNav();
    return () => {
      nav.reset(LoginScreen);
      setTimeout(() => auth.logout(), 0);
    };
  }),
};

const SETTINGS_LIST: Setting[] = [
  navToAction(NOTIF_SETTINGS),
  navToAction(ABOUT),
  navToAction(ACCOUNT),
  navToAction(SUPPORT),
  LOGOUT_ACTION,
  'LEGAL',
  ...LEGAL_LINKS.map((link: OpenLinkAction) => openUrlAction(link)),
];

const DEV_SETTINGS_LIST = [navToAction(DEV_SETTINGS), ...SETTINGS_LIST];

const SettingsScreen: Screen<{}> = () => {
  const user = requireLoggedInUser();
  const roles = user.roles?.roles ?? [];
  const isDev = __DEV__ ?? roles.includes('dev');

  const settings = isDev ? DEV_SETTINGS_LIST : SETTINGS_LIST;

  return (
    <View style={{padding: 20}}>
      <Settings settings={settings} />
    </View>
  );
};

SettingsScreen.title = 'Settings';

export default SettingsScreen;
