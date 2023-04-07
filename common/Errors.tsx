import {CodedError} from '@toolkit/core/util/CodedError';

export const UserNotFoundError = (uid: string) =>
  new CodedError(
    'favezilla.notif.invalid_uid',
    'Failed to enable push notifications',
    `User not found for UID ${uid}`,
  );
