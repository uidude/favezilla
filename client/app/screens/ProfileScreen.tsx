/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {useData} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {ProfilePic} from '@app/app/components/Profile';
import ThingRow from '@app/app/components/ThingRow';
import EditProfile from '@app/app/screens/EditProfile';
import {GetFaves} from '@app/common/AppLogic';
import {Fave, Profile, Thing} from '@app/common/DataTypes';

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
  const {Title, Body} = useComponents();
  const {navTo} = useNav();
  const isMe = id === profile.id;
  const about = profile.about ?? '';

  function isMyFave(thing: Thing) {
    return myFaves.find(fave => fave.thing.id === thing.id);
  }

  return (
    <ScrollView style={S.container}>
      <View style={S.profileHeader}>
        <ProfilePic pic={profile.pic} size={128} />
        <Title style={S.title}>
          {isMe && <View style={{width: 30}} />}
          {profile.name}
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
      edges: [
        [Profile, Fave, 1],
        [Fave, Thing, 1],
      ],
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
