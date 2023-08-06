import * as React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useApi} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {STRING, useStoredAsync} from '@toolkit/core/client/Storage';
import {useLoad} from '@toolkit/core/util/UseLoad';
import {useComponents} from '@toolkit/ui/components/Components';
import {Screen} from '@toolkit/ui/screen/Screen';
import {GetFaves, GetThings} from '@app/common/AppLogic';
import {Thing} from '@app/common/DataTypes';
import {SearchBar} from '@app/components/SearchBar';
import ThingRow from '@app/components/ThingRow';
import {useRegisterForPushNotifcations} from '@app/util/Notifications';
import {MediaTypeToggle, useMediaType} from './Favorites';

const Catalog: Screen<{}> = props => {
  requireLoggedInUser();
  const mediaType = useMediaType();
  const getAllThings = useApi(GetThings);
  const getFaves = useApi(GetFaves);
  const {faves, things} = useLoad(props, load);
  const {Subtitle} = useComponents();
  useRegisterForPushNotifcations();

  function faveFor(thing: Thing) {
    return faves.find(fave => fave.thing.id === thing.id);
  }

  return (
    <View style={{flex: 1}}>
      <SearchBar />
      <Subtitle style={S.subtitle}>
        Search ⬆ or browse a few of the most commonly favorited titles ⬇
      </Subtitle>
      <ScrollView style={S.container}>
        <MediaTypeToggle />
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

  async function load() {
    const [faves, allThings] = await Promise.all([getFaves(), getAllThings()]);
    const things = allThings.filter(t => t.type === mediaType);
    return {faves, things: things};
  }
};

Catalog.title = 'Discover';
Catalog.style = {type: 'top'};

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  createThingButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  subtitle: {
    fontWeight: '400',
    textAlign: 'center',
    paddingHorizontal: 30,
    paddingTop: 16,
  },
});

export default Catalog;
