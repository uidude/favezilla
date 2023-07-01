import {Alert, Platform} from 'react-native';
import {Opt} from '@toolkit/core/util/Types';

export const alertOk = (title: string, desc: string): Promise<void> => {
  return new Promise<void>(resolve => {
    if (Platform.OS === 'web') {
      alert(`${title}\n${desc}`);
      resolve();
    } else {
      Alert.alert(title, desc, [{text: 'OK', onPress: () => resolve()}], {
        cancelable: false,
      });
    }
  });
};

export const alertOkCancel = (
  title: string,
  desc?: Opt<string>,
): Promise<boolean> => {
  return new Promise<boolean>(resolve => {
    if (Platform.OS === 'web') {
      const descValue = desc != null ? `\n${desc}` : '';
      const result = window.confirm(`${title}${descValue}`);
      resolve(result);
    } else {
      Alert.alert(
        title,
        desc != null ? desc : undefined,
        [
          {text: 'Cancel', onPress: () => resolve(false)},
          {text: 'OK', onPress: () => resolve(true)},
        ],
        {cancelable: false},
      );
    }
  });
};
