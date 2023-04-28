import {api, noop} from '@toolkit/core/api/DataApi';
import {User} from '@toolkit/core/api/User';
import {Updater} from '@toolkit/data/DataStore';
import {firebaseFn} from '@toolkit/providers/firebase/client/FunctionsApi';
import {LoginUserInfo, useAddFave, useGetOrCreateUser} from './AppLogic';
import {Fave, Thing} from './DataTypes';

export const GET_USER = api<LoginUserInfo, User>(
  'getUser',
  firebaseFn,
  useGetOrCreateUser,
);
export const UPDATE_USER = api<Updater<User>, User>('updateUser', firebaseFn);
export const ADD_THING = api<Updater<Thing>, string>('addThing', firebaseFn);

export type ThingID = string;
export const ADD_FAVE = api<ThingID, Fave>('addFave', firebaseFn, useAddFave);
export const SEND_FAVE_NOTIF = api<Fave, void>(
  'sendFaveNotif',
  firebaseFn,
  noop,
);
export const SEND_THING_DELETE_NOTIF = api<string, void>(
  'sendThingDeleteNotif',
  firebaseFn,
);

// Admin panel
type AdminNotifPayload = {user: User; title?: string; body: string};

export const SEND_ADMIN_NOTIF = api<AdminNotifPayload, void>(
  'sendAdminNotif',
  firebaseFn,
);
export const BROADCAST_ADMIN_NOTIF = api<Omit<AdminNotifPayload, 'user'>, void>(
  'broadcastAdminNotif',
  firebaseFn,
);
