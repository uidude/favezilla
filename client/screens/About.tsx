import {simpleAboutScreen} from '@toolkit/screens/settings/AboutScreen';
import {Screen} from '@toolkit/ui/screen/Screen';

const Title = '❤️ Welcome to Favezilla ❤️';
const BodyMarkdown = `

I'd love to know the books you love.

I'd love share the books I love.

(this shouldn't be hard,
but it has been)

`;

const AboutScreen: Screen<{}> = simpleAboutScreen({
  title: Title,
  body: BodyMarkdown,
  center: true,
  showIcon: true,
});

AboutScreen.style = {nav: 'none', type: 'modal'};

export default AboutScreen;
