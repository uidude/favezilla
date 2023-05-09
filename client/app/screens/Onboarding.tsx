/**
 * TODO: Describe what this screen is doing :)
 *
 * @format
 */

import * as React from 'react';
import {User} from '@toolkit/core/api/User';
import {Opt} from '@toolkit/core/util/Types';
import {useTextInput} from '@toolkit/ui/UiHooks';
import MultistepFlow, {Step} from '@toolkit/ui/components/MultistepFlow';
import {useNav} from '@toolkit/ui/screen/Nav';
import {Screen} from '@toolkit/ui/screen/Screen';
import {useUpdateUserAndProfile} from '@app/common/AppLogic';
import {Profile} from '@app/common/DataTypes';
import {ProfilePicEditor} from './EditProfile';
import Favorites from './Favorites';
import ProfileScreen from './ProfileScreen';

type Props = {
  user: User;
  profile?: Partial<Profile>;
};

const Onboarding: Screen<Props> = props => {
  const {user, profile = {}} = props;
  const nav = useNav();
  const [NameInput, name] = useTextInput(user.name);
  const [AboutInput, about, setAbout] = useTextInput(profile.about ?? '');
  const [pic, setPic] = React.useState<Opt<string>>(user.pic);

  const updateUserAndProfile = useUpdateUserAndProfile();

  async function onFinish() {
    await updateUserAndProfile(user.id, {name, pic}, {about});
    nav.reset(ProfileScreen, {id: user.id});
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
      <Step title="Show yourself" subtitle="Upload your profile picture.">
        <ProfilePicEditor pic={pic} setPic={setPic} size={256} />
      </Step>
      <Step
        title="Tell us about yourself'"
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
};
Onboarding.title = 'Onboarding';
Onboarding.style = {nav: 'none'};
Onboarding.linkable = false;

export default Onboarding;
