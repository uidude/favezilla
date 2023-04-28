import {api, noop} from '@toolkit/core/api/DataApi';
import {User} from '@toolkit/core/api/User';
import {Updater} from '@toolkit/data/DataStore';
import {firebaseFn} from '@toolkit/providers/firebase/client/FunctionsApi';
import {LoginUserInfo, useAddFave, useGetOrCreateUser} from './AppLogic';
import {Fave, Thing} from './DataTypes';

export const GetUser = api<LoginUserInfo, User>(
  'getUser',
  firebaseFn,
  useGetOrCreateUser,
);
export const UpdateUser = api<Updater<User>, User>('updateUser', firebaseFn);
export const AddThing = api<Updater<Thing>, string>('addThing', firebaseFn);

export type ThingID = string;
export const AddFave = api<ThingID, Fave>('addFave', firebaseFn, useAddFave);
export const SendFaveNotif = api<Fave, void>('sendFaveNotif', firebaseFn, noop);
export const SendThingDeleteNotif = api<string, void>(
  'sendThingDeleteNotif',
  firebaseFn,
);

// Admin panel
type AdminNotifPayload = {user: User; title?: string; body: string};

export const SendAdminNotif = api<AdminNotifPayload, void>(
  'sendAdminNotif',
  firebaseFn,
);
export const BroadcastAdminNotif = api<Omit<AdminNotifPayload, 'user'>, void>(
  'broadcastAdminNotif',
  firebaseFn,
);
