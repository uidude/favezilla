import React, {Suspense} from 'react';
import {Ionicons, MaterialCommunityIcons, Octicons} from '@expo/vector-icons';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {setDefaultServerApi} from '@toolkit/core/api/DataApi';
import IdentityService from '@toolkit/core/api/Login';
import {
  SimpleUserMessaging,
  StatusContainer,
} from '@toolkit/core/client/Status';
import {AppContextProvider} from '@toolkit/core/util/AppContext';
import {filterHandledExceptions} from '@toolkit/core/util/Environment';
import {initializeFirebase} from '@toolkit/providers/firebase/Config';
import {FIRESTORE_DATASTORE} from '@toolkit/providers/firebase/DataStore';
import {firebaseFn} from '@toolkit/providers/firebase/client/FunctionsApi';
import {googleAuthProvider} from '@toolkit/providers/login/GoogleLogin';
import {Icon, registerIconPack} from '@toolkit/ui/components/Icon';
import AuthConfig from '@app/admin/app/AuthConfig';
import DrawerNavigator from '@app/admin/app/DrawerNavigator';
import {
  APP_CONFIG,
  FIREBASE_CONFIG,
  GOOGLE_LOGIN_CONFIG,
} from '@app/common/Config';
import {registerUiComponents} from './app/Components';
import {APP_INFO} from './lib/Config';

function initIcons() {
  registerIconPack('ion', Ionicons);
  registerIconPack('oct', Octicons);
  registerIconPack('mci', MaterialCommunityIcons);
}

filterHandledExceptions();

export default function AppShell() {
  const APP_CONTEXT = [FIRESTORE_DATASTORE, APP_CONFIG, APP_INFO];
  initializeFirebase(FIREBASE_CONFIG);
  initIcons();
  registerUiComponents();
  IdentityService.addProvider(googleAuthProvider(GOOGLE_LOGIN_CONFIG));

  setDefaultServerApi(firebaseFn);

  const theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: '#618BB3',
      accent: '#E3C067',
    },
  };

  return (
    <AppContextProvider ctx={APP_CONTEXT}>
      <PaperProvider theme={theme} settings={{icon: Icon}}>
        <StatusContainer top={true}>
          <Suspense fallback={null}>
            <SimpleUserMessaging style={{bottom: 100}} />
            <AuthConfig>
              <DrawerNavigator />
            </AuthConfig>
          </Suspense>
        </StatusContainer>
      </PaperProvider>
    </AppContextProvider>
  );
}
