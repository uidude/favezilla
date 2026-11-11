import {
  SimpleLoginScreenConfig,
  simpleLoginScreen,
} from '@toolkit/screens/login/LoginScreen';
import {Screen} from '@toolkit/ui/screen/Screen';
import {LOGIN_SCREEN_TOS} from '@app/common/Config';

const LOGIN_SCREEN_CONFIG: SimpleLoginScreenConfig = {
  title: 'Favezilla',
  subtitle: 'Discover and share the books you love.',
  authTypes: __DEV__ ? ['google', 'phone', 'apple'] : ['google', 'apple'],
  home: 'Favorites',
  onboarding: 'Onboarding',
  tos: LOGIN_SCREEN_TOS,
};

const LoginScreen: Screen<{}> = simpleLoginScreen(LOGIN_SCREEN_CONFIG);
LoginScreen.title = 'Login';
LoginScreen.style = {type: 'top', nav: 'none'};

export default LoginScreen;
