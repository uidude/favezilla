import {providesValue} from '@toolkit/core/providers/Providers';
import {AppConfigKey} from '@toolkit/core/util/AppConfig';
import {FirebaseConfig} from '@toolkit/providers/firebase/Config';
import {NotificationChannelsKey} from '@toolkit/services/notifications/NotificationChannel';
import {NOTIF_CHANNELS} from './NotifChannels';

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
  apiKey: 'fill-me-in',
  authDomain: 'fill-me-in',
  projectId: 'fill-me-in',
  storageBucket: 'fill-me-in',
  messagingSenderId: 'fill-me-in',
  appId: 'fill-me-in',
  measurementId: 'fill-me-in',
  namespace: 'helloworld',
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
 * https://github.com/npe-toolkit/toolkit/blob/main/docs/getting-started/Firebase.md
 */
export const GOOGLE_LOGIN_CONFIG = localConf['google-login'] ?? {
  iosClientId: 'fill-me-in',
  webClientId: 'fill-me-in',
  androidClientId: 'fill-me-in',
};

export const APP_CONFIG = {
  product: 'helloworld',
  dataEnv: 'prod',
  fbAppId: '',
};
providesValue(AppConfigKey, APP_CONFIG);

/**
 * For early development, it is convenient to run all possible logic on the client.
 * This should be switched to false for launch.
 */
export const PREFER_CLIENT_APIS = true;

// Add legal links here for easy reference.
export const LEGAL_LINKS = [
  {
    id: 'tos',
    label: 'Terms of Service',
    url: 'https://facebookincubator.github.io/npe-toolkit/docs/release/tos.html',
  },
];

export const LOGIN_SCREEN_TOS =
  '[Terms of Service](https://media.istockphoto.com/id/482103289/photo/clown-laywer.jpg?s=612x612&w=0&k=20&c=aHoyN4YAeyzTd5yLyt0WBQskRce-G9rkepA_TX3_RHs=) ' +
  'coming soon! ([Guide](https://facebookincubator.github.io/npe-toolkit/docs/release/tos.html))';

/**
 * Title and markdown for text of support page. A web support page is required for Apple App Store,
 * and this is also linked to from default settings page.
 *
 * The minimum here is to provide an email but you can customize as much as you would like.
 */
export const SUPPORT_PAGE_TITLE = 'helloworld Support';
export const SUPPORT_PAGE_TEXT = `
Sorry you're having problems!

You can contact us at [YOUR_EMAIL](mailto:YOUR_EMAIL) with any questions
or feedback on the product.

Thanks!
`;

export const MIXPANEL_TOKEN = null;

providesValue(NotificationChannelsKey, NOTIF_CHANNELS);
