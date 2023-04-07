/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Profile, requireLoggedInUser} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import ProfileScreen from '@app/app/screens/ProfileScreen';

type Props = {
  async: {
    me: Profile;
    profiles: Profile[];
  };
};

const Profiles: Screen<Props> = props => {
  const {profiles} = props.async;
  const user = requireLoggedInUser();
  const {Button, Title} = useComponents();
  const {navTo} = useNav();

  function goTo(id: string) {
    navTo(ProfileScreen, {id});
  }

  return (
    <ScrollView style={S.container} contentContainerStyle={S.content}>
      <Title style={S.otherProfiles}>Your Profile</Title>
      <Button onPress={() => goTo(user.id)} type="primary" style={S.button}>
        View
      </Button>
      <Title style={S.otherProfiles}>Other Profiles</Title>
      {profiles.map((profile, idx) => (
        <Button onPress={() => goTo(profile.id)} style={S.button} key={idx}>
          {profile.name}
        </Button>
      ))}
    </ScrollView>
  );
};
Profiles.title = 'Profiles';
Profiles.style = {type: 'top'};

Profiles.load = async () => {
  const user = requireLoggedInUser();
  const profileStore = useDataStore(Profile);
  const profiles = await profileStore.getAll();
  const myIndex = profiles.findIndex(p => p.id === user.id);
  const me = profiles[myIndex];
  profiles.splice(myIndex, 1);

  return {profiles, me};
};

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  row: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    marginHorizontal: 40,
    marginTop: 40,
    width: 250,
  },
  otherProfiles: {
    marginHorizontal: 40,
    marginTop: 40,
  },
});

export default Profiles;
