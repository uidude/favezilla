import {APP_CONFIG_KEY} from '@toolkit/core/util/AppConfig';
import {context} from '@toolkit/core/util/AppContext';
import {FirebaseConfig} from '@toolkit/providers/firebase/Config';

let localConf: Record<string, any> = {};
try {
  // @ts-ignore
  localConf = require('./.localconf.json');
} catch (_ignored) {}

/**
 * Fill in the Firebase config from values at
 * https://console.firebase.google.com/project/YOUR_PROJECT/settings/general/, under "Web apps"
 */
export const FIREBASE_CONFIG: FirebaseConfig = localConf['firebase'] ?? {
  apiKey: 'AIzaSyD0Gjnvn2M6OuBR45305fnCoR1QDbL1rJA',
  authDomain: 'favezilla.firebaseapp.com',
  projectId: 'favezilla',
  storageBucket: 'favezilla.appspot.com',
  messagingSenderId: '383529496724',
  appId: '1:383529496724:web:174c55124492d417c78481',
  measurementId: 'G-8HCB3DZ285',
  namespace: 'favezilla',
  emulators: {
    functions: {
      useEmulator: false,
    },
  },
};

/**
 * Fill in the client IDs from
 * https://console.cloud.google.com/apis/credentials?project=YOUR_PROJECT
 *
 * You also will need to add redirect URIs in the console, see
 * https://github.com/facebookincubator/npe-toolkit/blob/main/docs/getting-started/Firebase.md
 */
export const GOOGLE_LOGIN_CONFIG = localConf['google-login'] ?? {
  iosClientId:
    '383529496724-ua7k0sba6ccn3kfhfhrfjv7u4v2i0qll.apps.googleusercontent.com',
  webClientId:
    '383529496724-0tt33uo3bbq0t5sc94m2u9cigd8p92p6.apps.googleusercontent.com',
};

export const APP_CONFIG = context(APP_CONFIG_KEY, {
  product: 'favezilla',
  dataEnv: 'prod',
  fbAppId: '',
});

export const CLIENT_FALLBACK_ENABLED = true;
