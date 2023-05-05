/**
 * TODO: Describe what this screen is doing :)
 */

import {TestNotif} from '@app/common/Api';
import {registerForPushNotificationsAsync} from '@app/lib/Notifications';
import {useApi} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useAction} from '@toolkit/core/client/Action';
import {useBackgroundStatus} from '@toolkit/core/client/Status';
import {AdhocError} from '@toolkit/core/util/CodedError';
import {
  getNetworkDelayMs,
  useSetNetworkDelay,
} from '@toolkit/core/util/DevUtil';
import {useTextInput} from '@toolkit/ui/UiHooks';
import {useComponents} from '@toolkit/ui/components/Components';
import {Screen} from '@toolkit/ui/screen/Screen';
import * as React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

type Props = {
  async: {
    networkDelay: number;
  };
};

const DevSettings: Screen<Props> = props => {
  requireLoggedInUser();
  const {networkDelay} = props.async;
  const delayText = delayString(networkDelay);
  const {Body, H2} = useComponents();
  const {Button} = useComponents();
  const [DelayField, newDelay, setDelayText] = useTextInput(delayText);
  const setNetworkDelay = useSetNetworkDelay();
  const sendTestNotification = useApi(TestNotif);
  const [notify, sending] = useAction(testNotif);
  const {setMessage} = useBackgroundStatus();

  async function testNotif() {
    const pushToken = await registerForPushNotificationsAsync();
    if (!pushToken) {
      throw AdhocError('Failed to get push token');
    }
    const req = {
      token: pushToken.data,
      type: pushToken.type,
      sandbox: false,
    };
    await sendTestNotification(req);
  }

  async function setDelay() {
    const delay = parseInt(newDelay, 10);
    if (!isNaN(delay)) {
      await setNetworkDelay(delay);
      setMessage(`Network delay set to ${delay}ms`);
    }
  }

  async function clearDelay() {
    await setNetworkDelay(0);
    setDelayText('');
    setMessage(`Cleared network delay`);
  }

  return (
    <ScrollView style={S.container}>
      <H2>Notifications</H2>
      <Body>Test that notifications are working end-to-end</Body>
      <Button
        type="primary"
        onPress={notify}
        loading={sending}
        style={S.button}>
        Send Test Notification
      </Button>
      <View style={{height: 12}} />
      <H2>Network Delay</H2>
      <DelayField label="Delay in milliseconds" type="primary" />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
        <Button type="secondary" onPress={clearDelay} style={S.button}>
          Clear Delay
        </Button>
        <View style={{width: 12}} />
        <Button type="primary" onPress={setDelay} style={S.button}>
          Set
        </Button>
      </View>
    </ScrollView>
  );
};
DevSettings.title = 'Dev Settings';

DevSettings.load = async () => {
  const networkDelay = await getNetworkDelayMs();

  return {networkDelay};
};

function delayString(delay: number) {
  return delay === 0 ? '' : `${delay}`;
}

const S = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
  },
  row: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    alignSelf: 'flex-end',
    marginTop: 20,
    minWidth: 100,
  },
});

export default DevSettings;
