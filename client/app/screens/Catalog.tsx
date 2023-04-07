import * as React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import * as Device from 'expo-device';
import {useData} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useNotifications} from '@toolkit/services/notifications/NotificationsClient';
import {Screen} from '@toolkit/ui/screen/Screen';
import {GetFaves, GetThings} from '@app/common/AppLogic';
import {Fave, Thing} from '@app/common/DataTypes';
import {registerForPushNotificationsAsync} from '../../lib/Notifications';
import {SearchInput} from '../components/SearchBar';
import ThingRow from '../components/ThingRow';

type Props = {
  async: {
    faves: Fave[];
    allThings: Thing[];
  };
};

function searchMatches(thing: Thing, search: string): boolean {
  return (
    thing.name.toLowerCase().includes(search.toLowerCase()) ||
    thing.description.toLowerCase().includes(search.toLowerCase())
  );
}

const Catalog: Screen<Props> = props => {
  requireLoggedInUser();
  const {faves, allThings} = props.async;
  const [search, setSearch] = React.useState('');
  const {registerPushToken} = useNotifications();
  const things = allThings.filter(thing => searchMatches(thing, search));

  React.useEffect(() => {
    const registerForNotifs = async () => {
      const pushToken = Device.isDevice
        ? await registerForPushNotificationsAsync()
        : null;
      if (pushToken != null) {
        await registerPushToken({
          token: pushToken.data,
          type: pushToken.type,
          sandbox: __DEV__,
        });
      }
    };

    registerForNotifs();
  }, []);

  function faveFor(thing: Thing) {
    return faves.find(fave => fave.thing.id === thing.id);
  }

  async function onNewSearch(newSearch: string) {
    setSearch(newSearch);
  }

  return (
    <View style={{flex: 1}}>
      <SearchInput value={search} onNewText={onNewSearch} />
      <ScrollView style={S.container}>
        {things.map((thing, idx) => (
          <ThingRow
            thing={thing}
            fave={faveFor(thing)}
            canDelete={true}
            key={idx}
          />
        ))}
      </ScrollView>
    </View>
  );
};
Catalog.title = 'Catalog';
Catalog.style = {type: 'top'};

Catalog.load = async () => {
  const getAllThings = useData(GetThings);
  const getFaves = useData(GetFaves);

  const [faves, allThings] = await Promise.all([getFaves(), getAllThings()]);

  return {faves, allThings};
};

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  createThingButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default Catalog;
