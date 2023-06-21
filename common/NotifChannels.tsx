import NotificationChannel from '@toolkit/services/notifications/NotificationChannel';

export const NOTIF_CHANNELS: Record<string, NotificationChannel> = {
  thingFaved: new NotificationChannel({
    id: 'favezilla:THING_FAVED',
    name: 'Faves in common',
    description: 'When someone faves a book you also faved',
    titleFormat: 'New Fave',
    bodyFormat: '${likerName} faved a thing you\'ve faved: "${thingName}"',
    defaultDeliveryMethod: 'PUSH',
  }),

  admin: new NotificationChannel({
    id: 'favezilla:ADMIN',
    name: 'System notifications',
    description: 'Notifications from the app',
    titleFormat: '${title}',
    bodyFormat: '${body}',
    defaultDeliveryMethod: 'PUSH',
  }),
};
