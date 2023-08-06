import * as React from 'react';
import {
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {useApi} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useReload} from '@toolkit/core/client/Reload';
import {STRING, useStored, useStoredAsync} from '@toolkit/core/client/Storage';
import {useLoad} from '@toolkit/core/util/UseLoad';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {Screen} from '@toolkit/ui/screen/Screen';
import {GetFaves} from '@app/common/AppLogic';
import {ThingType} from '@app/common/DataTypes';
import {SearchBar} from '@app/components/SearchBar';
import ThingRow from '@app/components/ThingRow';
import {useCheckCountry, useRefresh} from '@app/util/Misc';

export function useMediaType(): ThingType {
  const [type] = useStored('mediaType', STRING, 'book');
  return type as ThingType;
}

export function MediaTypeToggle() {
  const [type, setType] = useStored('mediaType', STRING, 'book');
  const reload = useReload();

  const toggle = () => {
    setType(type === 'book' ? 'album' : 'book');
    setTimeout(reload, 100);
  };

  return (
    <SegmentedControl
      style={S.toggle}
      backgroundColor="#C0C0C0"
      fontStyle={{color: '#404040', fontSize: 16}}
      values={['Books', 'Albums']}
      selectedIndex={type === 'book' ? 0 : 1}
      onChange={toggle}
    />
  );
}

const Favorites: Screen<{}> = props => {
  requireLoggedInUser();
  useCheckCountry();
  const getFaves = useApi(GetFaves);
  const mediaType = useMediaType();
  const {faves} = useLoad(props, load);
  const {Subtitle} = useComponents();
  const refresh = useRefresh();
  const hasFaves = faves.length > 0;
  const typeText = mediaType === 'book' ? 'books' : 'albums';

  return (
    <View style={{flex: 1}}>
      <SearchBar />
      <ScrollView style={S.container}>
        <RefreshControl refreshing={false} onRefresh={refresh} />
        <MediaTypeToggle />
        {hasFaves && (
          <>
            {faves.map((fave, idx) => (
              <ThingRow thing={fave.thing} fave={fave} key={idx} />
            ))}
          </>
        )}
        {!hasFaves && (
          <View style={S.center}>
            <Subtitle style={S.noFavesText}>
              You haven't added any favorites yet!{'\n\n'}Search for {typeText}{' '}
              in the search box at the top of the page.
            </Subtitle>
          </View>
        )}
      </ScrollView>
    </View>
  );

  async function load() {
    const [allFaves] = await Promise.all([getFaves()]);

    const faves = allFaves.filter(fave => fave.thing.type === mediaType);
    return {faves};
  }
};

Favorites.loading = () => {
  const transform = usePulseAnimation();

  return (
    <View style={S.loading}>
      <Animated.View style={transform}>
        <Icon name="ion:heart" size={80} color="#FF0000" />
      </Animated.View>
    </View>
  );
};
Favorites.title = 'Favorites';
Favorites.style = {type: 'top'};

function usePulseAnimation() {
  const scale = new Animated.Value(1);
  const anim = {useNativeDriver: true, duration: 800};
  const ref = React.useRef({transform: [{scaleX: scale}, {scaleY: scale}]});

  function startAnimation() {
    Animated.timing(scale, {toValue: 0.5, ...anim}).start(() =>
      Animated.timing(scale, {toValue: 1, ...anim}).start(startAnimation),
    );
  }

  React.useEffect(startAnimation, []);
  return ref.current;
}

const S = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFavesText: {
    textAlign: 'center',
    maxWidth: 250,
  },
  toggle: {
    marginVertical: 24,
    paddingVertical: 20,
    width: 300,
    alignSelf: 'center',
  },
});

export default Favorites;
