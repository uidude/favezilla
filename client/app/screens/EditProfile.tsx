/**
 * Screen for editing the user's profile.
 */

import * as React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import {SaveFormat, manipulateAsync} from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import {User, requireLoggedInUser} from '@toolkit/core/api/User';
import {useAction} from '@toolkit/core/client/Action';
import {StatusBar} from '@toolkit/core/client/UserMessaging';
import {withTimeout} from '@toolkit/core/util/DevUtil';
import {Opt} from '@toolkit/core/util/Types';
import {getRequired, useDataStore} from '@toolkit/data/DataStore';
import {useStorage} from '@toolkit/data/FileStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {ProfilePic} from '@app/app/components/Profile';
import ProfileScreen from '@app/app/screens/ProfileScreen';
import {Profile} from '@app/common/DataTypes';

type Props = {
  async: {
    me: Profile;
  };
};

function useUpdateUserAndProfile() {
  const userStore = useDataStore(User);
  const profileStore = useDataStore(Profile);

  return async function updateUserAndProfile(
    id: string,
    user: Partial<User>,
    profile: Partial<Profile>,
  ) {
    // Ensure user` has updated before updating profile
    await userStore.update({...user, id});

    const userFieldsToCopy = {
      name: user.name,
      ...(user.pic && {pic: user.pic}),
    };
    // TODO: Consider using transactions
    await profileStore.update({...profile, ...userFieldsToCopy, id});
  };
}

async function pickSquarePhoto(size: number = 256) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: true,
    aspect: [1, 1],
  });
  const image = result.assets && result.assets[0];

  if (image) {
    // Crop square box in the middle
    const width = image.width;
    const height = image.height;
    const boxSize = Math.min(width, height);
    const x = (width - boxSize) / 2;
    const y = (height - boxSize) / 2;
    const cropped = await manipulateAsync(
      image.uri,
      [
        {crop: {originX: x, originY: y, width: boxSize, height: boxSize}},
        {resize: {width: size, height: size}},
      ],
      {compress: 1, format: SaveFormat.PNG},
    );
    return cropped.uri;
  }

  return null;
}

const EditProfile: Screen<Props> = props => {
  requireLoggedInUser();
  const {me} = props.async;
  const {Button, TextInput} = useComponents();
  const [name, setName] = React.useState(me.name);
  const [bio, setBio] = React.useState(me.about ?? '');
  const [pic, setPic] = React.useState(me.pic);
  const nav = useNav();
  const updateUserAndProfile = useUpdateUserAndProfile();
  const {upload} = useStorage(Profile, 'pic', {maxBytes: 50000000});
  const [uploadPic, uploading] = useAction(uploadPicHandler);
  const [save, saving] = useAction(saveHandler);
  const toUploadUri = React.useRef<Opt<string>>();

  function back(reload: boolean = false) {
    if (nav.backOk()) {
      nav.back();
      nav.setParams({reload});
    } else {
      nav.navTo(ProfileScreen, {id: me.id, reload});
    }
  }

  async function saveHandler() {
    await updateUserAndProfile(me.id, {name, pic}, {about: bio});
    back(true);
  }

  async function editPic() {
    toUploadUri.current = await pickSquarePhoto();
    uploadPic();
  }

  async function uploadPicHandler() {
    const uri = toUploadUri.current;
    if (uri != null) {
      const uploadResult = await withTimeout(() => upload(uri), 30000);
      setPic(uploadResult.storageUri);
    }
  }

  return (
    <ScrollView style={S.container} contentContainerStyle={S.content}>
      <StatusBar style={{marginBottom: 20}} />
      <PressableSpring onPress={editPic}>
        {uploading ? (
          <View style={S.uploading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <ProfilePic pic={pic} size={128} style={{alignSelf: 'center'}} />
        )}
      </PressableSpring>
      <View style={{height: 20}} />
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
        <Button type="primary" onPress={save} loading={saving}>
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
  const me = await getRequired(profileStore, id);

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
  profilePic: {
    width: 128,
    height: 128,
    borderWidth: 1,
    borderColor: '#888',
    alignSelf: 'center',
  },
  uploading: {
    width: 128,
    height: 128,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default EditProfile;
