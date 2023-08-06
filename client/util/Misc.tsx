import * as React from 'react';
import {Platform} from 'react-native';
import {useApi} from '@toolkit/core/api/DataApi';
import {useReload} from '@toolkit/core/client/Reload';
import {use} from '@toolkit/core/providers/Providers';
import {CacheManagerKey} from '@toolkit/data/DataCache';
import {CheckCountry} from '@app/common/AppLogic';

/**
 * Throw an error asynchronously on current page if user is not in a supported country.
 *
 * Async is to not block the user interface. This means may show app functionality before
 * switching to show an error.
 */
export function useCheckCountry() {
  const checkCountry = useApi(CheckCountry);
  const [error, setError] = React.useState();
  if (error) {
    throw error;
  }

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      checkCountry().catch(e => setError(e));
    }
  }, []);
}

export function useRefresh() {
  const reload = useReload();
  const cacheManager = use(CacheManagerKey);
  return async () => {
    await cacheManager.clear();
    reload();
  };
}
