import {APP_CONFIG, FIREBASE_CONFIG} from '@app/common/Config';
import {FirestoreDatastore} from '@toolkit/providers/firebase/DataStore';
import {initFirebaseServer} from '@toolkit/providers/firebase/server/Config';
import {
  AuthenticateMiddleware,
  ResultLoggerMiddleware,
  RolesCheckMiddleware,
  initMiddlewares,
  providersMiddleware,
} from '@toolkit/providers/firebase/server/Handler';

// Follow the wiki below to enable Firestore security rule enforcement in Functions:
// https://github.com/npe-toolkit/npe-toolkit/blob/main/docs/datastore/server-rules.md
initFirebaseServer(FIREBASE_CONFIG, APP_CONFIG);

const providers = [FirestoreDatastore, APP_CONFIG];

initMiddlewares([
  providersMiddleware(providers),
  AuthenticateMiddleware,
  RolesCheckMiddleware,
]);

exports.favezilla = require('./handlers');
