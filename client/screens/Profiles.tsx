/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import { Profile } from '@app/common/DataTypes';
import { ProfileRow } from '@app/components/Profile';
import { requireLoggedInUser } from '@toolkit/core/api/User';
import { useDataStore } from '@toolkit/data/DataStore';
import { useComponents } from '@toolkit/ui/components/Components';
import { Screen } from '@toolkit/ui/screen/Screen';
import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

type Props = {
  async: {
    me: Profile;
    profiles: Profile[];
  };
};

const Profiles: Screen<Props> = props => {
  requireLoggedInUser();
  const {profiles, me} = props.async;
  const {Title} = useComponents();

  return (
    <ScrollView style={S.container} contentContainerStyle={S.content}>
      <ProfileRow profile={me} isMe={true} />
      <Title style={S.otherProfiles}>Other Profiles</Title>
      {profiles.map((profile, idx) => (
        <ProfileRow profile={profile} key={idx} />
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
    alignItems: 'stretch',
  },
  otherProfiles: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#D0D0D0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#B0B0B0',
  },
});

export default Profiles;
