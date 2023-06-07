import React, {Suspense} from 'react';
import {DefaultTheme} from 'react-native-paper';
import {setDefaultServerApi} from '@toolkit/core/api/DataApi';
import {SimpleUserMessaging} from '@toolkit/core/client/Status';
import {filterHandledExceptions} from '@toolkit/core/util/Environment';
import {firebaseFn} from '@toolkit/providers/firebase/client/FunctionsApi';
import AuthConfig from '@app/admin/app/AuthConfig';
import DrawerNavigator from '@app/admin/app/DrawerNavigator';
import AppConfig from './AppConfig';

filterHandledExceptions();

export default function AppShell() {
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
    <AppConfig>
      <Suspense fallback={null}>
        <SimpleUserMessaging style={{bottom: 100}} />
        <AuthConfig>
          <DrawerNavigator />
        </AuthConfig>
      </Suspense>
    </AppConfig>
  );
}
