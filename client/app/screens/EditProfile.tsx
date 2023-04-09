/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {ProfileUser, User, requireLoggedInUser} from '@toolkit/core/api/User';
import {getRequired, useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {Profile, Thing} from '@app/common/DataTypes';
import ProfileScreen from './ProfileScreen';

type Props = {
  async: {
    me: Profile;
  };
};

function profileUserFor(id: string, user: Partial<User>): Partial<ProfileUser> {
  return {
    id,
    name: user.name,
    pic: user.pic,
  };
}

/**
 * Update user info in `User`, `ProfileUser, and `Profile` stores
 */
function useUpdateUserInfo() {
  const {id} = requireLoggedInUser();
  const userStore = useDataStore(User);
  const profileUserStore = useDataStore(ProfileUser);
  const profileStore = useDataStore(Profile);

  return async function updateUserInfo(
    id: string,
    user: Partial<User>,
    profile: Partial<Profile>,
  ) {
    // Ensure user has updated before updating profileUserStore
    await userStore.update({...user, id});

    // TODO: Consider using transactions
    await Promise.all([
      profileUserStore.update(profileUserFor(id, user)),
      profileStore.update({...profile, id}),
    ]);
  };
}

const EditProfile: Screen<Props> = props => {
  requireLoggedInUser();
  const {me} = props.async;
  const {Button, TextInput} = useComponents();
  const [name, setName] = React.useState(me.user!.name);
  const [bio, setBio] = React.useState(me.about ?? '');
  const nav = useNav();
  const updateUserInfo = useUpdateUserInfo();

  function back(reload: boolean = false) {
    if (nav.backOk()) {
      nav.back();
      nav.setParams({reload: true});
    } else {
      nav.navTo(ProfileScreen, {id: me.id, reload: true});
    }
  }

  async function save() {
    await updateUserInfo(me.id, {name}, {about: bio});
    back(true);
  }

  return (
    <ScrollView style={S.container} contentContainerStyle={S.content}>
      <TextInput
        type="primary"
        value={name}
        onChangeText={setName}
        label="Name"
      />
      <View style={{height: 20}} />
      <TextInput
        type="primary"
        multiline={true}
        numberOfLines={5}
        value={bio}
        onChangeText={setBio}
        label="About you"
      />
      <View style={{height: 20}} />
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <Button type="tertiary" onPress={() => back()}>
          Cancel
        </Button>
        <Button type="primary" onPress={save}>
          Save
        </Button>
      </View>
    </ScrollView>
  );
};
EditProfile.title = 'Edit Your Profile';

EditProfile.load = async () => {
  const {id} = requireLoggedInUser();
  const profileStore = useDataStore(Profile);
  const me = await getRequired(profileStore, id, {edges: [ProfileUser]});

  return {me};
};

const S = StyleSheet.create({
  container: {
    flex: 1,
    margin: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
});

export default EditProfile;
