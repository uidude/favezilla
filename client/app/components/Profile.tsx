/**
 * Commmon profile components and utilities.
 */

import * as React from 'react';
import {
  Image,
  ImageErrorEventData,
  Linking,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {Opt} from '@toolkit/core/util/Types';
import {useStorage} from '@toolkit/data/FileStore';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import ProfileScreen from '@app/app/screens/ProfileScreen';
import {Profile} from '@app/common/DataTypes';

type ProfilePicProps = {
  /** Uri of the profile pic. */
  pic: Opt<string>;

  /* Width and height of the pic to render */
  size: number;

  style?: StyleProp<ViewStyle>;
};

/**
 * Render a profile pic in the "standard" style for the app.
 */
export const ProfilePic = (props: ProfilePicProps) => {
  const {pic, size, style} = props;
  const {getUrl} = useStorage(Profile, 'pic');
  const [url, setUrl] = React.useState(urlOrNull(pic));
  const [error, setError] = React.useState<string>();
  const sizeStyle = {width: size, height: size, borderRadius: size / 2};
  const [loaded, setLoaded] = React.useState(false);

  async function loadPic() {
    setLoaded(false);
    if (pic && pic.startsWith('firebasestorage://')) {
      const url = await getUrl(pic);
      setUrl(url);
    } else {
      setUrl(urlOrNull(pic));
    }
  }

  React.useEffect(() => {
    loadPic();
  }, [pic]);

  function onError(e: NativeSyntheticEvent<ImageErrorEventData>) {
    const err = e.nativeEvent.error;
    setError(typeof err === 'string' ? err : 'Unknown error');
  }

  function onLoad() {
    setLoaded(true);
  }

  let content;

  if (shouldShowLocalDevHint(error)) {
    content = (
      <Text style={S.devHint} onPress={() => devLoadImage(url)}>
        (DEV){'\n'}load
      </Text>
    );
  } else if (error == null && url != null) {
    content = (
      <Image
        source={{uri: url}}
        style={[S.profilePic, sizeStyle, {opacity: loaded ? 1 : 0}]}
        onLoad={onLoad}
        onError={onError}
      />
    );
  } else {
    content = null;
  }

  return (
    <View style={[{width: size, height: size}, S.profileBox, style]}>
      {content}
    </View>
  );
};

// Special case for local development possibly not loading images due to CORS
function shouldShowLocalDevHint(error: Opt<string>) {
  return (
    error != null &&
    error?.startsWith('Failed to load') &&
    __DEV__ &&
    Platform.OS === 'web' &&
    location.hostname === 'localhost'
  );
}

function urlOrNull(uri: Opt<string>) {
  return uri != null &&
    (uri.startsWith('http://') ||
      uri.startsWith('https://') ||
      uri.startsWith('data:image') ||
      uri.startsWith('file:'))
    ? uri
    : null;
}

function devLoadImage(url: Opt<string>) {
  if (Platform.OS === 'web' && url != null) {
    Linking.openURL(url);

    if (
      confirm(
        "http://localhost profile images sometimes don't load due to CORS. " +
          'Opened image in another tab, click OK to reload. ' +
          "This behavior isn't shown in production.",
      )
    ) {
      document.location.reload();
    }
  }
}

type ProfileRowProps = {
  profile: Profile;
  isMe?: boolean;
};

/**
 * Show a row with the user's profile pic, and name and about.
 */
export const ProfileRow = (props: ProfileRowProps) => {
  const {profile, isMe = false} = props;
  const {navTo} = useNav();

  function goProfile() {
    navTo(ProfileScreen, {id: profile.id});
  }

  return (
    <PressableSpring style={S.row} onPress={goProfile}>
      <ProfilePic pic={profile.pic} size={60} />
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

const S = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  profilePic: {
    borderWidth: 1,
    borderColor: '#888',
  },
  profileBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  devHint: {
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
