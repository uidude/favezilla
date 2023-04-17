import icon from '@assets/icon.png';
import {APP_INFO_KEY} from '@toolkit/core/client/Theme';
import {context} from '@toolkit/core/util/AppContext';

export const APP_INFO = context(APP_INFO_KEY, {
  appName: 'Hax App',
  appIcon: icon,
});
