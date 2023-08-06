import React from 'react';
import icon from '@assets/icon.png';
import {Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import {Provider as PaperProvider} from 'react-native-paper';
import {
  setDefaultServerApi,
  setPreferClientApis,
} from '@toolkit/core/api/DataApi';
import {LocalFlags} from '@toolkit/core/api/Flags';
import {ConsoleLogger, DevLogger, MultiLogger} from '@toolkit/core/api/Log';
import IdentityService from '@toolkit/core/api/Login';
import {StatusContainer} from '@toolkit/core/client/Status';
import {AppInfoKey} from '@toolkit/core/client/Theme';
import {Scope} from '@toolkit/core/providers/Client';
import {providesValue} from '@toolkit/core/providers/Providers';
import {InMemoryCacheManager} from '@toolkit/data/DataCache';
import {initializeFirebase} from '@toolkit/providers/firebase/Config';
import {FirestoreFilestore} from '@toolkit/providers/firebase/FileStore';
import {FirestoreDatastoreWithCaching} from '@toolkit/providers/firebase/FirestoreDatastore';
import {initializeFirestore} from '@toolkit/providers/firebase/client/Firestore';
import {firebaseFn} from '@toolkit/providers/firebase/client/FunctionsApi';
import {appleAuthProvider} from '@toolkit/providers/login/AppleLogin';
import {googleAuthProvider} from '@toolkit/providers/login/GoogleLogin';
import {MixpanelLogger} from '@toolkit/providers/mixpanel/Logger';
import {BLACK_AND_WHITE} from '@toolkit/ui/QuickThemes';
import {Icon, registerIconPack} from '@toolkit/ui/components/Icon';
import {usePaperComponents} from '@toolkit/ui/components/Paper';
import {allowWebScreenDomains} from '@toolkit/ui/screen/WebScreen';
import AuthConfig from '@app/AuthConfig';
import {
  APP_CONFIG,
  FIREBASE_CONFIG,
  GOOGLE_LOGIN_CONFIG,
  LEGAL_LINKS,
  MIXPANEL_TOKEN,
  PREFER_CLIENT_APIS,
} from '@app/common/Config';
import {NOTIF_CHANNELS} from '@app/common/NotifChannels';

type Props = {
  children: React.ReactNode;
};

/**
 * App-wide configuration, including setting up application-wide scope and providers.
 */
function AppConfig(props: Props) {
  const {children} = props;

  const loggers = [DevLogger, ConsoleLogger];
  if (MIXPANEL_TOKEN != null) {
    loggers.push(MixpanelLogger(MIXPANEL_TOKEN));
  }
  const providers = [
    LocalFlags,
    MultiLogger(loggers),
    FirestoreDatastoreWithCaching,
    InMemoryCacheManager,
    FirestoreFilestore,
    APP_CONFIG,
    AppInfo,
    NOTIF_CHANNELS,
  ];

  initializeFirebase(FIREBASE_CONFIG);
  initializeFirestore();
  IdentityService.addProvider(googleAuthProvider(GOOGLE_LOGIN_CONFIG));
  IdentityService.addProvider(appleAuthProvider());
  registerIconPack('ion', Ionicons);
  registerIconPack('mci', MaterialCommunityIcons);
  usePaperComponents();

  setDefaultServerApi(firebaseFn);
  setPreferClientApis(PREFER_CLIENT_APIS);
  allowWebScreenDomains(LEGAL_LINKS.map(l => l.url));

  return (
    <Scope providers={providers}>
      <PaperProvider theme={BLACK_AND_WHITE} settings={{icon: Icon}}>
        <StatusContainer top={true}>
          <AuthConfig>{children}</AuthConfig>
        </StatusContainer>
      </PaperProvider>
    </Scope>
  );
}

const AppInfo = providesValue(AppInfoKey, {
  appName: 'favezilla',
  appIcon: icon,
});

export default AppConfig;
