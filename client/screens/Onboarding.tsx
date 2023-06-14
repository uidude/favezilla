/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {useAuth} from '@toolkit/core/api/Auth';
import {User} from '@toolkit/core/api/User';
import {Opt} from '@toolkit/core/util/Types';
import {useLoad} from '@toolkit/core/util/UseLoad';
import {useDataStore} from '@toolkit/data/DataStore';
import {useTextInput} from '@toolkit/ui/UiHooks';
import {MultistepFlow, Step} from '@toolkit/ui/components/MultistepFlow';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {useUpdateUserAndProfile} from '@app/common/AppLogic';
import {Profile} from '@app/common/DataTypes';
import {ProfilePicEditor} from '@app/screens/EditProfile';
import Favorites from '@app/screens/Favorites';

type Props = {
  user: User;
};

const Onboarding: Screen<Props> = props => {
  const {user} = props;
  const profileStore = useDataStore(Profile);
  const {profile} = useLoad(props, load);

  const [NameInput, name] = useTextInput(user.name);
  const [AboutInput, about, setAbout] = useTextInput(profile.about ?? '');
  const [pic, setPic] = React.useState<Opt<string>>(user.pic);
  const [loading, setLoading] = React.useState(false);
  const auth = useAuth();
  const nav = useNav();

  const updateUserAndProfile = useUpdateUserAndProfile();

  async function onFinish() {
    await updateUserAndProfile(user.id, {name, pic}, {about});
    await auth.checkLogin();
    // TODO Show error if checkLogin() fails
    nav.reset(Favorites);
  }

  function onCancel() {
    nav.navTo(Favorites);
  }

  function onAboutSkip() {
    setAbout(profile.about ?? '');
  }

  // TODO implement skip
  return (
    <MultistepFlow onCancel={onCancel} onFinish={onFinish}>
      <Step
        title="What's your name?"
        subtitle="This will be visible on your profile.">
        <NameInput type="primary" style={{marginTop: 32}} placeholder="Name" />
      </Step>
      <Step
        title="Show yourself"
        subtitle="Upload your profile picture."
        nextOk={!loading}>
        <ProfilePicEditor
          pic={pic}
          setPic={setPic}
          size={256}
          isLoading={setLoading}
        />
      </Step>
      <Step
        title="Tell us about yourself"
        subtitle="Enter a short blurb that will be shown on your profile."
        required={false}
        onSkip={onAboutSkip}>
        <AboutInput
          type="primary"
          multiline={true}
          numberOfLines={5}
          placeholder="About"
        />
      </Step>
    </MultistepFlow>
  );

  async function load() {
    const profile =
      (await profileStore.get(user.id)) ?? ({} as Partial<Profile>);
    return {profile};
  }
};
Onboarding.title = 'Onboarding';
Onboarding.style = {nav: 'none'};
Onboarding.linkable = false;

export default Onboarding;
