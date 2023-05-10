import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  setClientFallbackEnabled,
  setDefaultServerApi,
} from '@toolkit/core/api/DataApi';
import {ConsoleLogger, DevLogger, MultiLogger} from '@toolkit/core/api/Log';
import IdentityService from '@toolkit/core/api/Login';
import {
  SimpleUserMessaging,
  StatusContainer,
} from '@toolkit/core/client/Status';
import {registerAppConfig} from '@toolkit/core/util/AppConfig';
import {AppContextProvider} from '@toolkit/core/util/AppContext';
import {
  deviceIsMobile,
  filterHandledExceptions,
} from '@toolkit/core/util/Environment';
import {initializeFirebase} from '@toolkit/providers/firebase/Config';
import {FIRESTORE_DATASTORE} from '@toolkit/providers/firebase/DataStore';
import {FIRESTORE_FILESTORE} from '@toolkit/providers/firebase/FileStore';
import {firebaseFn} from '@toolkit/providers/firebase/client/FunctionsApi';
import {fbAuthProvider} from '@toolkit/providers/login/FacebookLogin';
import {googleAuthProvider} from '@toolkit/providers/login/GoogleLogin';
import {MixpanelLogger} from '@toolkit/providers/mixpanel/Logger';
import {
  NavContext,
  useReactNavScreens,
} from '@toolkit/providers/navigation/ReactNavigation';
import PhoneInput from '@toolkit/screens/login/PhoneInput';
import PhoneVerification from '@toolkit/screens/login/PhoneVerification';
import {NotificationSettingsScreen} from '@toolkit/screens/settings/NotificationSettings';
import {BLACK_AND_WHITE} from '@toolkit/ui/QuickThemes';
import {Icon, registerIconPack} from '@toolkit/ui/components/Icon';
import {usePaperComponents} from '@toolkit/ui/components/Paper';
import {bottomTabLayout} from '@toolkit/ui/layout/BottomTabLayout';
import {ModalLayout} from '@toolkit/ui/layout/LayoutBlocks';
import {layoutSelector} from '@toolkit/ui/layout/LayoutSelector';
import {topbarLayout} from '@toolkit/ui/layout/TopbarLayout';
import {Routes} from '@toolkit/ui/screen/Nav';
import WebViewScreen, {
  allowWebScreenDomains,
} from '@toolkit/ui/screen/WebScreen';
import AuthConfig from '@app/app/AuthConfig';
import AboutScreen from '@app/app/screens/AboutScreen';
import Catalog from '@app/app/screens/Catalog';
import CreateNewThingScreen from '@app/app/screens/CreateThingScreen';
import DevSettings from '@app/app/screens/DevSettings';
import EditProfile from '@app/app/screens/EditProfile';
import Favorites from '@app/app/screens/Favorites';
import LoginScreen from '@app/app/screens/LoginScreen';
import ProfileScreen from '@app/app/screens/ProfileScreen';
import Profiles from '@app/app/screens/Profiles';
import SettingsScreen from '@app/app/screens/SettingsScreen';
import StartupScreen from '@app/app/screens/StartupScreen';
import ThingScreen from '@app/app/screens/ThingScreen';
import {
  APP_CONFIG,
  CLIENT_FALLBACK_ENABLED,
  FIREBASE_CONFIG,
  GOOGLE_LOGIN_CONFIG,
  LEGAL_LINKS,
  MIXPANEL_TOKEN,
} from '@app/common/Config';
import 'expo-dev-client';
import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import 'react-native-gesture-handler';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Onboarding from './app/screens/Onboarding';
import {APP_INFO, NOTIF_CHANNELS_CONTEXT} from './lib/Config';

//
/**
 * Hacky workaround for 'react-native-webview' crashing app when JS is unloaded.
 *
 * `onContentProcessDidTerminate` bridge is always called when view is unloaded and
 * if JS engine is already stopped this will terminate the app, as the event callback
 * fires and React force quits.
 *
 * This happens in Expo Go but could also see it occuring during hot reloading.
 *
 * Temporary fix is to patch to set onContentProcessDidTerminate in bridge when the prop is
 * passed into the React Component.
 *
 */

let reactNativeWebViewCrashPatched = false;

// TODO: Move this to FirebasePhoneUtils, as that is the proximate use case that is most important
function patchReactNativeWebViewCrash() {
  if (Platform.OS !== 'web') {
    try {
      if (!reactNativeWebViewCrashPatched) {
        const WebViewShared = require('react-native-webview/lib/WebViewShared');
        const useWebWiewLogic = WebViewShared.useWebWiewLogic;
        /** @ts-ignore */
        WebViewShared.useWebWiewLogic = props => {
          const result = useWebWiewLogic(props);
          if (!props.onContentProcessDidTerminateProp && result) {
            /** @ts-ignore */
            delete result['onContentProcessDidTerminate'];
          }
          return result;
        };
        reactNativeWebViewCrashPatched = true;
      }
    } catch (ignored) {}
  }
}
patchReactNativeWebViewCrash();

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
      title: 'Catalog',
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

const LOGGERS = [DevLogger, ConsoleLogger];
if (MIXPANEL_TOKEN != null) {
  LOGGERS.push(MixpanelLogger(MIXPANEL_TOKEN));
}

const APP_CONTEXT = [
  APP_CONFIG,
  APP_INFO,
  FIRESTORE_DATASTORE,
  FIRESTORE_FILESTORE,
  MultiLogger(LOGGERS),
  NOTIF_CHANNELS_CONTEXT,
];

export default function App() {
  registerAppConfig(APP_CONFIG);
  initializeFirebase(FIREBASE_CONFIG);
  IdentityService.addProvider(fbAuthProvider());
  IdentityService.addProvider(googleAuthProvider(GOOGLE_LOGIN_CONFIG));
  setClientFallbackEnabled(CLIENT_FALLBACK_ENABLED);
  registerIconPack('ion', Ionicons);
  registerIconPack('mci', MaterialCommunityIcons);
  usePaperComponents();
  setDefaultServerApi(firebaseFn);
  allowWebScreenDomains(LEGAL_LINKS.map(l => l.url));

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
    <AppContextProvider ctx={APP_CONTEXT}>
      <PaperProvider theme={BLACK_AND_WHITE} settings={{icon: Icon}}>
        <StatusContainer top={true}>
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
        </StatusContainer>
      </PaperProvider>
    </AppContextProvider>
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
