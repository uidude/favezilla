import {providesValue} from '@toolkit/core/providers/Providers';
import {AppConfigKey} from '@toolkit/core/util/AppConfig';
import {FirebaseConfig} from '@toolkit/providers/firebase/Config';
import {NotificationChannelsKey} from '@toolkit/services/notifications/NotificationChannel';
import {NOTIF_CHANNELS} from '@app/common/NotifChannels';

let localConf: Record<string, any> = {};
try {
  // @ts-ignore
  localConf = require('./.localconf.json');
} catch (_ignored) {}
/**
 * Fill in the Firebase config from values at
 * https://console.firebase.google.com/project/YOUR_PROJECT/settings/general/, under "Web apps"
 *
 * Per https://firebase.google.com/docs/projects/api-keys the `apiKey` is OK to include in checked-in code,
 * and it can be found by looking at your production JavaScript anyway. However by checking it into a public
 * repositoriy you increase the likelihood of abuse. With new projects you should limit user access
 * via an allowlist until you are ready to launch, and at launch time review Firestore and Firebase Storage
 * privacy rules as well as quota limits.
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
 * https://console.cloud.google.com/apis/credentials
 *
 * You also will need to add redirect URIs in the console, see
 * https://github.com/facebookincubator/npe-toolkit/blob/main/docs/getting-started/Firebase.md
 */
export const GOOGLE_LOGIN_CONFIG = localConf['google-login'] ?? {
  iosClientId:
    '383529496724-7j3up3nd60u0cjmbpgir7ggqmt8jtrds.apps.googleusercontent.com',
  webClientId:
    '383529496724-0tt33uo3bbq0t5sc94m2u9cigd8p92p6.apps.googleusercontent.com',
  androidClientId:
    '383529496724-uke5c6c2gmuotopmegks33gqaq9es0pm.apps.googleusercontent.com',

  // Different iOS builds need different iOS clients IDs if you want to suppport
  // side-by-side install (recommended for ease of testing)
  bundles: {
    'com.npetoolkit.favezilla': {
      iosClientId:
        '383529496724-ua7k0sba6ccn3kfhfhrfjv7u4v2i0qll.apps.googleusercontent.com',
      androidClientId:
        '383529496724-sde740nljlllndj90e1qfkgonvmdg95d.apps.googleusercontent.com',
    },
    'com.npetoolkit.favezilla.alpha': {
      iosClientId:
        '383529496724-ie6cguas967e57aruue45bavvn3i1nho.apps.googleusercontent.com',
    },
  },
};

export const APP_CONFIG = {
  product: 'favezilla',
  dataEnv: 'prod',
  fbAppId: '',
};
providesValue(AppConfigKey, APP_CONFIG);

export const CLIENT_FALLBACK_ENABLED = true;

// Add legal links here for easy reference.
export const LEGAL_LINKS = [
  {
    id: 'tos',
    label: 'Terms of Service',
    url: 'https://app.termly.io/document/terms-of-service/477358a4-d5ec-4635-8eed-739005f7968b',
  },
  {
    id: 'privacy-policy',
    label: 'Privacy Policy',
    url: 'https://app.termly.io/document/privacy-policy/158a201a-46b3-4c47-9434-e9a012757ea6',
  },
];

export const LOGIN_SCREEN_TOS =
  'By continuing, you accept our [Terms of Service](https://app.termly.io/document/terms-of-service/477358a4-d5ec-4635-8eed-739005f7968b) ' +
  'and [Privacy Policy](https://app.termly.io/document/privacy-policy/158a201a-46b3-4c47-9434-e9a012757ea6).';

export const MIXPANEL_TOKEN = 'ae6dcaf512d2311b66a99a020c2ef1c3';

providesValue(NotificationChannelsKey, NOTIF_CHANNELS);
