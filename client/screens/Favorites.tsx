import * as React from 'react';
import {Animated, ScrollView, StyleSheet, View} from 'react-native';
import {useApi} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useLoad} from '@toolkit/core/util/UseLoad';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {Screen} from '@toolkit/ui/screen/Screen';
import {GetFaves} from '@app/common/AppLogic';
import {SearchBar} from '@app/components/SearchBar';
import ThingRow from '@app/components/ThingRow';
import {useCheckCountry} from '@app/util/Availability';

const Favorites: Screen<{}> = props => {
  requireLoggedInUser();

  useCheckCountry();
  const getFaves = useApi(GetFaves);
  const {faves} = useLoad(props, load);
  const {Subtitle} = useComponents();
  const hasFaves = faves.length > 0;

  return (
    <View style={{flex: 1}}>
      <SearchBar />
      {hasFaves && (
        <ScrollView style={S.container}>
          {faves.map((fave, idx) => (
            <ThingRow thing={fave.thing} fave={fave} key={idx} />
          ))}
        </ScrollView>
      )}

      {!hasFaves && (
        <View style={S.center}>
          <Subtitle style={S.noFavesText}>
            You haven't added any favorites yet!{'\n\n'}Search for books in the
            search box at the top of the page.
          </Subtitle>
        </View>
      )}
    </View>
  );

  async function load() {
    const faves = await getFaves();
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
    marginTop: -72,
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
});

export default Favorites;
