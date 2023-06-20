import {
  SimpleLoginScreenConfig,
  simpleLoginScreen,
} from '@toolkit/screens/login/LoginScreen';
import {Screen} from '@toolkit/ui/screen/Screen';

const LOGIN_SCREEN_CONFIG: SimpleLoginScreenConfig = {
  title: 'Favezilla',
  subtitle: 'Share your favorite books!\n(and soon other favorite things)',
  authTypes: __DEV__ ? ['google', 'phone', 'apple'] : ['phone'],
  home: 'Favorites',
  onboarding: 'Onboarding',
  tos: '*Terms of Service coming soon*',
};

const LoginScreen: Screen<{}> = simpleLoginScreen(LOGIN_SCREEN_CONFIG);
LoginScreen.style = {type: 'top', nav: 'none'};

export default LoginScreen;
