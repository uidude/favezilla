import {simpleAboutScreen} from '@toolkit/screens/settings/AboutScreen';
import {Screen} from '@toolkit/ui/screen/Screen';

const TitleMarkdown = 'Favezilla Support';
const DescriptionMarkdown = `
Sorry you're having problems!

You can contact us at [favezilla.support@innate.net](favezilla.support@innate.net) with any questions
or feedback on the product. Thanks!


Thanks,
Your friendly Favezilla dinosaur
`;

const Support: Screen<{}> = simpleAboutScreen({
  title: TitleMarkdown,
  body: DescriptionMarkdown,
  showIcon: true,
});

Support.style = {nav: 'none'};

export default Support;
