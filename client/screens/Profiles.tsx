/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {useEnabled} from '@toolkit/core/api/Flags';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useLoad} from '@toolkit/core/util/UseLoad';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Screen} from '@toolkit/ui/screen/Screen';
import {IncludeTestProfiles} from '@app/common/AppLogic';
import {Profile} from '@app/common/DataTypes';
import {ProfileRow} from '@app/components/Profile';
import {useRefresh} from '@app/util/Misc';

const Profiles: Screen<{}> = props => {
  const user = requireLoggedInUser();
  const showTestProfiles = useEnabled(IncludeTestProfiles);
  const profileStore = useDataStore(Profile);
  const {profiles, me} = useLoad(props, load);
  const {Title} = useComponents();
  const refresh = useRefresh();

  return (
    <ScrollView style={S.container} contentContainerStyle={S.content}>
      <RefreshControl refreshing={false} onRefresh={refresh} />
      <ProfileRow profile={me} isMe={true} />
      <Title style={S.otherProfiles}>Other Profiles</Title>
      {profiles.map((profile, idx) => (
        <ProfileRow profile={profile} key={idx} />
      ))}
    </ScrollView>
  );

  async function load() {
    let profiles = await profileStore.getAll();
    if (!showTestProfiles) {
      profiles = profiles.filter(p => !p.test);
    }
    const myIndex = profiles.findIndex(p => p.id === user.id);
    const me = profiles[myIndex];
    profiles.splice(myIndex, 1);

    return {profiles, me};
  }
};

Profiles.title = 'Profiles';
Profiles.style = {type: 'top'};

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
