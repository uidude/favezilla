import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SimpleUserMessaging} from '@toolkit/core/client/Status';
import {
  deviceIsMobile,
  filterHandledExceptions,
} from '@toolkit/core/util/Environment';
import {
  NavContext,
  useReactNavScreens,
} from '@toolkit/providers/navigation/ReactNavigation';
import PhoneInput from '@toolkit/screens/login/PhoneInput';
import PhoneVerification from '@toolkit/screens/login/PhoneVerification';
import {NotificationSettingsScreen} from '@toolkit/screens/settings/NotificationSettings';
import {bottomTabLayout} from '@toolkit/ui/layout/BottomTabLayout';
import {ModalLayout} from '@toolkit/ui/layout/LayoutBlocks';
import {layoutSelector} from '@toolkit/ui/layout/LayoutSelector';
import {topbarLayout} from '@toolkit/ui/layout/TopbarLayout';
import {Routes} from '@toolkit/ui/screen/Nav';
import WebViewScreen from '@toolkit/ui/screen/WebScreen';
import AppConfig from '@app/AppConfig';
import AuthConfig from '@app/AuthConfig';
import AboutScreen from '@app/screens/AboutScreen';
import Catalog from '@app/screens/Catalog';
import CreateNewThingScreen from '@app/screens/CreateThingScreen';
import DevSettings from '@app/screens/DevSettings';
import EditProfile from '@app/screens/EditProfile';
import Favorites from '@app/screens/Favorites';
import LoginScreen from '@app/screens/LoginScreen';
import Onboarding from '@app/screens/Onboarding';
import ProfileScreen from '@app/screens/ProfileScreen';
import Profiles from '@app/screens/Profiles';
import SettingsScreen from '@app/screens/SettingsScreen';
import StartupScreen from '@app/screens/StartupScreen';
import ThingScreen from '@app/screens/ThingScreen';
import 'expo-dev-client';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

filterHandledExceptions();

// TODO: Hack to hide header to avoid double back buttons.
// Fix this by converting these to Screens
// @ts-ignore
PhoneInput.style = {nav: 'none'};
// @ts-ignore
PhoneVerification.style = {nav: 'none'};
const ROUTES: Routes = {
  StartupScreen,
  LoginScreen,
  Favorites,
  Catalog,
  EditProfile,
  Profiles,
  ProfileScreen,
  SettingsScreen,
  DevSettings,
  CreateNewThingScreen,
  PhoneInput,
  PhoneVerification,
  ThingScreen,
  WebViewScreen,
  AboutScreen,
  NotificationSettingsScreen,
  Onboarding,
};
const Stack = createStackNavigator();

const NAV = {
  main: [
    {
      icon: 'ion:book-outline',
      title: 'Discover',
      screen: Catalog,
    },
    {
      icon: 'ion:heart-outline',
      title: 'Faves',
      screen: Favorites,
    },

    {
      icon: 'ion:people-outline',
      title: 'Profiles',
      screen: Profiles,
    },
  ],
  extra: [
    {
      icon: 'ion:settings-outline',
      title: 'Settings',
      screen: SettingsScreen,
    },
  ],
  home: Favorites,
};

export default function App() {
  const layout = layoutSelector({
    base: bottomTabLayout(NAV),
    desktopWeb: topbarLayout(NAV),
    modal: ModalLayout,
    loginScreen: LoginScreen,
  });

  const {navScreens, linkingScreens, getPathFromState} = useReactNavScreens(
    ROUTES,
    layout,
    Stack.Screen,
  );
  // For deep links
  const linking = {
    prefixes: ['npetoolkit.com'],
    config: linkingScreens,
    getPathFromState,
  };

  return (
    <AppConfig>
      <AuthConfig>
        <View style={S.background}>
          <SafeAreaProvider style={S.container}>
            <SimpleUserMessaging style={S.messaging} />
            <NavigationContainer linking={linking}>
              <StatusBar style="auto" />
              <NavContext routes={ROUTES} />
              <Stack.Navigator
                screenOptions={{headerShown: false}}
                initialRouteName="StartupScreen">
                {navScreens}
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaProvider>
        </View>
      </AuthConfig>
    </AppConfig>
  );
}

const S = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
    borderRadius: deviceIsMobile() ? 0 : 16,
    overflow: 'hidden',
  },
  messaging: {
    bottom: 100,
  },
  background: {flex: 1, backgroundColor: '#202020'},
});
