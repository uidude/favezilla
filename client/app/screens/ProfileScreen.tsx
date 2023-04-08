/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {useData} from '@toolkit/core/api/DataApi';
import {Profile, requireLoggedInUser} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Screen} from '@toolkit/ui/screen/Screen';
import {GetFaves} from '@app/common/AppLogic';
import {Fave, Thing} from '@app/common/DataTypes';
import ThingRow from '../components/ThingRow';

type Props = {
  id: string;
  async: {
    profile: Profile;
    faves: Fave[];
    myFaves: Fave[];
  };
};

const ProfileScreen: Screen<Props> = props => {
  requireLoggedInUser();
  const {profile, faves, myFaves} = props.async;
  const {Title} = useComponents();

  function isMyFave(thing: Thing) {
    return myFaves.find(fave => fave.thing.id === thing.id);
  }

  return (
    <ScrollView style={S.container}>
      <View style={S.profileHeader}>
        <Image source={{uri: profile.pic ?? ''}} style={S.profilePic} />
        <Title style={S.title}>
          {profile.name}'s{'\n'}Favorites
        </Title>
      </View>
      {faves.map((fave, idx) => (
        <ThingRow key={idx} thing={fave.thing} fave={isMyFave(fave.thing)} />
      ))}
    </ScrollView>
  );
};
ProfileScreen.title = 'Profile';

ProfileScreen.load = async props => {
  const profileStore = useDataStore(Profile);
  const faveStore = useDataStore(Fave);
  const getFaves = useData(GetFaves);
  let [profile, faves, myFaves] = await Promise.all([
    profileStore.get(props.id),
    faveStore.getMany({
      query: {where: [{field: 'user', op: '==', value: props.id}]},
      edges: [Thing],
    }),
    getFaves(),
  ]);
  faves.sort((a, b) => a.thing.name.localeCompare(b.thing.name));
  if (profile == null) throw new Error('Profile not found');

  return {profile, faves, myFaves};
};

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  profileHeader: {
    paddingTop: 36,
    paddingBottom: 16,
    alignItems: 'center',
  },
  profilePic: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: '#888',
  },
  title: {
    textAlign: 'center',
    marginTop: 12,
  },
});

export default ProfileScreen;
