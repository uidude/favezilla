/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import {Animated, ScrollView, StyleSheet, View} from 'react-native';
import {useData} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useReload} from '@toolkit/core/client/Reload';
import {sleep} from '@toolkit/core/util/DevUtil';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {Screen} from '@toolkit/ui/screen/Screen';
import {SearchBar} from '@app/app/components/SearchBar';
import ThingRow from '@app/app/components/ThingRow';
import {GetFaves} from '@app/common/AppLogic';
import {Fave} from '@app/common/DataTypes';
import {Thing} from '@app/common/DataTypes';

type Props = {
  async: {
    faves: Fave[];
  };
};

const Favorites: Screen<Props> = props => {
  const user = requireLoggedInUser();
  const {faves} = props.async;
  const {Subtitle} = useComponents();
  const hasFaves = faves.length > 0;
  const faveStore = useDataStore(Fave);
  const reload = useReload();

  async function addFave(thing: Thing) {
    await faveStore.create({user, thing});
    reload();
  }

  return (
    <View style={{flex: 1}}>
      <SearchBar onAdd={addFave} />
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

Favorites.load = async () => {
  const getFaves = useData(GetFaves);

  // Give time to show the fun loading screen
  const [faves] = await Promise.all([getFaves(), sleep(0 /*2500*/)]);

  return {faves};
};

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
