/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import DefaultThumb from '@assets/bookicon-small.png';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {useScreenState} from '@toolkit/ui/screen/Layout';
import {Screen} from '@toolkit/ui/screen/Screen';
import {Fave, Profile, Thing} from '@app/common/DataTypes';
import {ProfileRow} from './Profiles';

type Props = {
  id: string;
  async: {
    thing: Thing;
  };
};

const ThingScreen: Screen<Props> = props => {
  requireLoggedInUser();
  const {thing} = props.async;
  const {Title, Subtitle} = useComponents();
  const {setScreenState} = useScreenState();
  const image = thing.thumb ? {uri: thing.thumb} : DefaultThumb;

  React.useEffect(() => setScreenState({title: thing.name}), []);

  return (
    <ScrollView style={S.container}>
      <View style={S.profileHeader}>
        <Image style={S.image} source={image} resizeMode="contain" />
        <Subtitle style={S.title}>{thing.description}</Subtitle>
      </View>
      <Title style={S.sectionHeader}>Favorited By</Title>
      {thing.faves.map((fave, idx) => (
        <ProfileRow profile={fave.user} key={idx} />
      ))}
    </ScrollView>
  );
};
ThingScreen.title = ' ';

ThingScreen.load = async props => {
  const thingStore = useDataStore(Thing);
  const thing = await thingStore.get(props.id, {
    edges: [
      [Thing, Fave, 1],
      [Fave, Profile, 1],
    ],
  });
  if (thing == null) throw new Error('Thing not found');

  return {thing};
};

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    paddingVertical: 40,
    alignItems: 'center',
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
