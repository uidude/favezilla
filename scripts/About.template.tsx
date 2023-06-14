import {simpleAboutScreen} from '@toolkit/screens/settings/AboutScreen';
import {Screen} from '@toolkit/ui/screen/Screen';

const Title = 'Welcome to the NPE Toolkit!';
const BodyMarkdown = `

When building standalone apps, teams generally start from zero.

Most standalone apps share a common set of features and functionality that are considered table stakes.

By providing a common, easily deployable and customizable baaseline set of functionality, we hope that the Toolkit will enable you to ship faster.

Good luck, and let us know what you're building!`;

const AboutScreen: Screen<{}> = simpleAboutScreen({
  title: Title,
  body: BodyMarkdown,
  center: true,
});

AboutScreen.style = {nav: 'none', type: 'modal'};

export default AboutScreen;
