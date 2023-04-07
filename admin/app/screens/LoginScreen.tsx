import {simpleLoginScreen} from '@toolkit/screens/login/LoginScreen';
import {Screen} from '@toolkit/ui/screen/Screen';

const LoginScreen: Screen<{}> = simpleLoginScreen({
  title: 'Hax App Admin',
  authTypes: ['google'],
  home: 'users',
});

LoginScreen.style = {
  nav: 'none',
};

export default LoginScreen;
