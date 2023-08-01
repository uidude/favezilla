import {simpleAboutScreen} from '@toolkit/screens/settings/AboutScreen';
import {Screen} from '@toolkit/ui/screen/Screen';
import {SUPPORT_PAGE_TEXT, SUPPORT_PAGE_TITLE} from '@app/common/Config';

const Support: Screen<{}> = simpleAboutScreen({
  title: SUPPORT_PAGE_TITLE,
  body: SUPPORT_PAGE_TEXT,
  showIcon: true,
});

Support.style = {nav: 'none'};

export default Support;
