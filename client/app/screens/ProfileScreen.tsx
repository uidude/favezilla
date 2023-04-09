/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {useData} from '@toolkit/core/api/DataApi';
import {ProfileUser, requireLoggedInUser} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {GetFaves} from '@app/common/AppLogic';
import {Fave, Profile, Thing} from '@app/common/DataTypes';
import ThingRow from '../components/ThingRow';
import EditProfile from './EditProfile';

type Props = {
  id: string;
  async: {
    profile: Profile;
    faves: Fave[];
    myFaves: Fave[];
  };
};

const ProfileScreen: Screen<Props> = props => {
  const {id} = requireLoggedInUser();
  const {profile, faves, myFaves} = props.async;
  const {Title, Subtitle, Button, Body} = useComponents();
  const {navTo} = useNav();
  const profileUser = profile.user!;
  const isMe = id === profileUser.id;
  const about = profile.about ?? '';

  function isMyFave(thing: Thing) {
    return myFaves.find(fave => fave.thing.id === thing.id);
  }

  return (
    <ScrollView style={S.container}>
      <View style={S.profileHeader}>
        <Image source={{uri: profileUser.pic ?? ''}} style={S.profilePic} />
        <Title style={S.title}>
          {isMe && <View style={{width: 30}} />}
          {profileUser.name}
          {isMe && (
            <PressableSpring
              style={{marginLeft: 6}}
              onPress={() => navTo(EditProfile)}>
              <Icon name="mci:account-edit-outline" size={24} />
            </PressableSpring>
          )}
        </Title>
        <Body style={S.subtitle}>{about}</Body>
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
  const getFaves = useData(GetFaves);
  let [profile, myFaves] = await Promise.all([
    profileStore.get(props.id, {
      edges: [ProfileUser, [Profile, Fave, 1], [Fave, Thing, 1]],
    }),
    getFaves(),
  ]);
  const faves = profile!.faves!;
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
  subtitle: {
    textAlign: 'center',
    maxWidth: 400,
    marginHorizontal: 24,
    marginTop: 12,
  },
});

export default ProfileScreen;
