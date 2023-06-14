import * as React from 'react';
import {Platform} from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {useNotifications} from '@toolkit/services/notifications/NotificationsClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<Notifications.DevicePushToken> {
  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    throw new Error('Failed to get push token for push notification!');
  }

  return await Notifications.getDevicePushTokenAsync();
}

export function useRegisterForPushNotifcations() {
  const {registerPushToken} = useNotifications();

  async function registerForNotifs() {
    if (Device.isDevice && Platform.OS !== 'web') {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken == null) {
        return;
      }

      const req = {
        token: pushToken.data,
        type: pushToken.type,
        sandbox: false,
      };
      await registerPushToken(req);
    }
  }

  React.useEffect(() => {
    registerForNotifs();
  }, []);
}
