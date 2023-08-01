/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useApi} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useLoad} from '@toolkit/core/util/UseLoad';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {GetFaves} from '@app/common/AppLogic';
import {Fave, Profile, Thing} from '@app/common/DataTypes';
import {ProfilePic} from '@app/components/Profile';
import ThingRow from '@app/components/ThingRow';
import EditProfile from '@app/screens/EditProfile';

type Props = {
  id: string;
};

const ProfileScreen: Screen<Props> = props => {
  const {id} = props;
  const user = requireLoggedInUser();
  const profileStore = useDataStore(Profile);
  const getFaves = useApi(GetFaves);
  const {profile, faves, myFaves} = useLoad(props, load);
  const {navTo} = useNav();
  const {Title, Body, Button} = useComponents();

  const isMe = user.id === profile.id;
  const about = profile.about ?? '';

  function isMyFave(thing: Thing) {
    return myFaves.find(fave => fave.thing.id === thing.id);
  }

  function edit() {
    navTo(EditProfile);
  }

  return (
    <ScrollView style={S.container}>
      <View style={S.profileHeader}>
        <ProfilePic pic={profile.pic} size={128} />
        <Title style={S.title}>{profile.name}</Title>
        <Body style={S.subtitle}>{about}</Body>
        {isMe && (
          <Button type="primary" style={S.button} onPress={edit}>
            Edit
          </Button>
        )}
      </View>
      {faves.map((fave, idx) => (
        <ThingRow key={idx} thing={fave.thing} fave={isMyFave(fave.thing)} />
      ))}
    </ScrollView>
  );

  async function load() {
    const profileQuery = profileStore.required(id, {
      edges: [
        [Profile, Fave, 1],
        [Fave, Thing, 1],
      ],
    });

    let [profile, myFaves] = await Promise.all([profileQuery, getFaves()]);
    const faves = profile!.faves!;
    faves.sort((a, b) => a.thing.name.localeCompare(b.thing.name));

    return {profile, faves, myFaves};
  }
};
ProfileScreen.title = 'Profile';

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
  button: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
});

export default ProfileScreen;
