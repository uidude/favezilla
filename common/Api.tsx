import {noop, serverApi} from '@toolkit/core/api/DataApi';
import {User} from '@toolkit/core/api/User';
import {Updater} from '@toolkit/data/DataStore';
import {PushToken} from '../../npe-toolkit/lib/services/notifications/NotificationTypes';
import {LoginUserInfo, useAddFave, useGetOrCreateUser} from './AppLogic';
import {Fave, Thing} from './DataTypes';

export const GetUser = serverApi<LoginUserInfo, User>(
  'getUser',
  useGetOrCreateUser,
);
export const UpdateUser = serverApi<Updater<User>, User>('updateUser');
export const AddThing = serverApi<Updater<Thing>, string>('addThing');

export type ThingID = string;
export const AddFave = serverApi<ThingID, Fave>('addFave', useAddFave);
export const SendFaveNotif = serverApi<Fave, void>('sendFaveNotif', noop);
export const SendThingDeleteNotif = serverApi<string, void>(
  'sendThingDeleteNotif',
);

// Admin panel
type AdminNotifReq = {user: User; title?: string; body: string};
export const SendAdminNotif = serverApi<AdminNotifReq, void>('sendAdminNotif');
type BroadcastReq = {title?: string; body: string};
export const BroadcastNotif = serverApi<BroadcastReq, void>('broadcastNotif');

/** Dev API to send yourself a test notification. */
export const TestNotif = serverApi<PushToken, void>('testNotif');
