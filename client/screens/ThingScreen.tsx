/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import DefaultThumb from '@assets/bookicon-small.png';
import {useEnabled} from '@toolkit/core/api/Flags';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useLoad} from '@toolkit/core/util/UseLoad';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {useScreenState} from '@toolkit/ui/screen/Layout';
import {Screen} from '@toolkit/ui/screen/Screen';
import {IncludeTestProfiles} from '@app/common/AppLogic';
import {Fave, Profile, Thing} from '@app/common/DataTypes';
import {ProfileRow} from '@app/components/Profile';
import {useRefresh} from '@app/util/Misc';

type Props = {
  id: string;
};

const ThingScreen: Screen<Props> = props => {
  requireLoggedInUser();
  const thingStore = useDataStore(Thing);
  const showTestProfiles = useEnabled(IncludeTestProfiles);
  const {thing} = useLoad(props, load);
  const {Title, Subtitle} = useComponents();
  const {setScreenState} = useScreenState();
  const refresh = useRefresh();
  const image = thing.thumb ? {uri: thing.thumb} : DefaultThumb;

  React.useEffect(() => setScreenState({title: thing.name}), []);

  return (
    <ScrollView style={S.container}>
      <RefreshControl refreshing={false} onRefresh={refresh} />
      <View style={S.profileHeader}>
        <Image style={S.image} source={image} resizeMode="contain" />
        <Subtitle style={S.title}>{thing.by ?? thing.description}</Subtitle>
      </View>
      <Title style={S.sectionHeader}>Favorited By</Title>
      {thing.faves.map((fave, idx) => (
        <ProfileRow profile={fave.user} key={idx} />
      ))}
    </ScrollView>
  );
  async function load() {
    const thing = await thingStore.required(props.id, {
      edges: [
        [Thing, Fave, 1],
        [Fave, Profile, 1],
      ],
    });
    if (!showTestProfiles) {
      thing.faves = thing.faves.filter(f => !f.user.test);
    }

    return {thing};
  }
};
ThingScreen.title = ' ';

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    textAlign: 'center',
    marginTop: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 7,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionHeader: {
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#D0D0D0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#B0B0B0',
  },
});

export default ThingScreen;
