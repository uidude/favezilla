/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import ProfileScreen from '@app/app/screens/ProfileScreen';
import {Profile} from '@app/common/DataTypes';

type Props = {
  async: {
    me: Profile;
    profiles: Profile[];
  };
};

type ProfileRowProps = {
  profile: Profile;
  isMe?: boolean;
};

export const ProfileRow = (props: ProfileRowProps) => {
  const {profile, isMe = false} = props;
  const {navTo} = useNav();

  function goPro() {
    navTo(ProfileScreen, {id: profile.id});
  }

  return (
    <PressableSpring style={S.row} onPress={goPro}>
      <Image source={{uri: profile.pic ?? ''}} style={S.profilePic} />
      <View style={{alignSelf: 'center', marginLeft: 16, flex: 1}}>
        <Text style={{fontSize: 18}}>
          {profile.name} {isMe && "(<- that's you!)"}
        </Text>
        {profile.about != null && (
          <Text style={{color: 'gray'}} numberOfLines={1}>
            {profile.about}
          </Text>
        )}
      </View>
    </PressableSpring>
  );
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  otherProfiles: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: '#D0D0D0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#B0B0B0',
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#888',
  },
});

export default Profiles;
