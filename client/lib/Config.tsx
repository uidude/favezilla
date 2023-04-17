import icon from '@assets/icon.png';
import {APP_INFO_KEY} from '@toolkit/core/client/Theme';
import {context} from '@toolkit/core/util/AppContext';
import {NOTIF_CHANNELS_KEY} from '@toolkit/services/notifications/NotificationChannel';
import {NOTIF_CHANNELS} from '@app/common/NotifChannels';

export const APP_INFO = context(APP_INFO_KEY, {
  appName: 'favezilla',
  appIcon: icon,
});

export const NOTIF_CHANNELS_CONTEXT = context(
  NOTIF_CHANNELS_KEY,
  NOTIF_CHANNELS,
);
