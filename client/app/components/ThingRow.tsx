import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import DefaultThumb from '@assets/bookicon-small.png';
import {Ionicons} from '@expo/vector-icons';
import {useApi} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useAction} from '@toolkit/core/client/Action';
import {useReload} from '@toolkit/core/client/Reload';
import {useMessageOnFail} from '@toolkit/core/client/UserMessaging';
import {Opt} from '@toolkit/core/util/Types';
import {useDataStore} from '@toolkit/data/DataStore';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {SEND_FAVE_NOTIF, SEND_THING_DELETE_NOTIF} from '@app/common/Api';
import {AddFave, RemoveThing} from '@app/common/AppLogic';
import {Fave, Thing} from '@app/common/DataTypes';
import ThingScreen from '../screens/ThingScreen';

type Props = {
  thing: Thing;
  /** If it's a fave of the current user */
  fave?: Opt<Fave>;
  canDelete?: boolean;
};

export default function ThingRow(props: Props) {
  const {thing, fave, canDelete = false} = props;
  requireLoggedInUser();
  const addFave = useApi(AddFave);
  const faveStore = useDataStore(Fave);
  const removeThing = useApi(RemoveThing);
  const reload = useReload();
  const messageOnFail = useMessageOnFail();
  const {navTo} = useNav();
  const [makeFaveAction] = useAction(makeFave);
  const [unfaveAction] = useAction(unFave);
  const sendFaveNotif = useApi(SEND_FAVE_NOTIF);
  const sendDeleteNotif = useApi(SEND_THING_DELETE_NOTIF);

  async function makeFave() {
    const fave = await addFave(thing.id);
    sendFaveNotif(fave).catch((e: Error) =>
      console.error("Couldn't send notification", e),
    );
    reload();
  }

  async function unFave() {
    // TODO: Look up based on thing ID instead
    if (fave) {
      await faveStore.remove(fave.id);
      reload();
    }
  }

  async function onRemove() {
    await removeThing(thing.id);
    sendDeleteNotif(thing.name).catch((e: Error) =>
      console.error("Couldn't send notification", e),
    );
    reload();
  }

  function goThing() {
    navTo(ThingScreen, {id: thing.id});
  }

  const image = thing.thumb ? {uri: thing.thumb} : DefaultThumb;

  return (
    <PressableSpring style={S.row} onPress={goThing}>
      <Image style={S.image} source={image} resizeMode="contain" />
      <View style={{alignSelf: 'center', marginLeft: 10, flex: 1}}>
        <Text style={{fontSize: 18}}>{props.thing.name}</Text>
        <Text style={{color: 'gray'}}>{props.thing.description}</Text>
      </View>

      {canDelete && (
        <PressableSpring
          onPress={messageOnFail(onRemove)}
          style={{alignSelf: 'center', marginRight: 6}}>
          <Ionicons name="close-circle-outline" color="gray" size={30} />
        </PressableSpring>
      )}
      {fave != null ? (
        <PressableSpring onPress={unfaveAction} style={{alignSelf: 'center'}}>
          <Ionicons name="heart" color="red" size={30} />
        </PressableSpring>
      ) : (
        <PressableSpring onPress={makeFaveAction} style={{alignSelf: 'center'}}>
          <Ionicons name="heart-outline" color="gray" size={30} />
        </PressableSpring>
      )}
    </PressableSpring>
  );
}

const S = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 7,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
