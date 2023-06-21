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
import LoginScreen from './LoginScreen';

const ABOUT = {
  icon: 'information-outline',
  label: 'About',
  to: About,
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

const SETTINGS: Setting[] = [
  navToAction(DEV_SETTINGS),
  navToAction(NOTIF_SETTINGS),
  LOGOUT_ACTION,
  navToAction(ABOUT),
  'LEGAL',
  ...LEGAL_LINKS.map((link: OpenLinkAction) => openUrlAction(link)),
];

const SettingsScreen: Screen<{}> = () => {
  requireLoggedInUser();

  return (
    <View style={{padding: 20}}>
      <Settings settings={SETTINGS} />
    </View>
  );
};

SettingsScreen.title = 'Settings';

export default SettingsScreen;
