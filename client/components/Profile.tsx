/**
 * Commmon profile components and utilities.
 */

import * as React from 'react';
import {
  Linking,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {Opt} from '@toolkit/core/util/Types';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Profile} from '@app/common/DataTypes';
import {CachingImage} from '@app/components/CachingImage';
import ProfileScreen from '@app/screens/ProfileScreen';

type ProfilePicProps = {
  /** Uri of the profile pic. */
  pic: Opt<string>;

  /* Width and height of the pic to render */
  size: number;

  /** Style for the containing view */
  style?: StyleProp<ViewStyle>;
};

/**
 * Render a profile pic in the "standard" style for the app.
 */
export const ProfilePic = (props: ProfilePicProps) => {
  const {pic, size, style} = props;
  const sizeStyle = {width: size, height: size, borderRadius: size / 2};
  const [loaded, setLoaded] = React.useState(false);

  function onLoad() {
    setLoaded(true);
  }

  const errorView = (url: string, err: string) => {
    return shouldShowLocalDevHint(err) ? (
      <Text style={S.devHint} onPress={() => devLoadImage(url)}>
        (DEV){'\n'}load
      </Text>
    ) : (
      <></>
    );
  };

  return (
    <View style={[{width: size, height: size}, S.profileBox, style]}>
      <CachingImage
        source={{uri: pic ?? ''}}
        style={[S.profilePic, sizeStyle, {opacity: loaded ? 1 : 0}]}
        onLoad={onLoad}
        errorView={errorView}
      />
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
