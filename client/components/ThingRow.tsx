import React from 'react';
import {ActivityIndicator, Image, StyleSheet, Text, View} from 'react-native';
import DefaultThumb from '@assets/bookicon-small.png';
import {useApi} from '@toolkit/core/api/DataApi';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useAction} from '@toolkit/core/client/Action';
import {useReload} from '@toolkit/core/client/Reload';
import {useMessageOnFail} from '@toolkit/core/client/Status';
import {Opt} from '@toolkit/core/util/Types';
import {useDataStore} from '@toolkit/data/DataStore';
import {Icon} from '@toolkit/ui/components/Icon';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {useNav} from '@toolkit/ui/screen/Nav';
import {AddFave, SendFaveNotif} from '@app/common/Api';
import {RemoveThing} from '@app/common/AppLogic';
import {Fave, Thing} from '@app/common/DataTypes';
import ThingScreen from '@app/screens/ThingScreen';

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
  const [makeFaveAction, faveLoading] = useAction('AddFavorite', makeFave);
  const [unfaveAction] = useAction('Unfavorite', unFave);
  const sendFaveNotif = useApi(SendFaveNotif);

  async function makeFave() {
    const fave = await addFave(thing.id);
    faveStore.putCache && (await faveStore.putCache(fave.id, 'add', fave));
    sendFaveNotif({thingId: thing.id});
    reload();
  }

  async function unFave() {
    if (fave) {
      await faveStore.remove(fave.id);
      reload();
    }
  }

  async function onRemove() {
    await removeThing(thing.id);
    reload();
  }

  function goThing() {
    navTo(ThingScreen, {id: thing.id});
  }

  const image = thing.thumb ? {uri: thing.thumb} : DefaultThumb;

  return (
    <PressableSpring style={S.row} onPress={goThing} delay={100}>
      <Image style={S.image} source={image} resizeMode="contain" />
      <View style={{alignSelf: 'center', marginLeft: 10, flex: 1}}>
        <Text style={{fontSize: 18}}>{props.thing.name}</Text>
        <Text style={{color: 'gray'}}>{props.thing.description}</Text>
      </View>

      {canDelete && (
        <ThingRowAction
          onPress={messageOnFail(onRemove)}
          icon="ion:close-circle-outline"
        />
      )}
      <View style={{width: 6}} />
      {faveLoading ? (
        <ActivityIndicator
          size={24}
          style={{paddingVertical: 6, paddingHorizontal: 3}}
        />
      ) : fave != null ? (
        <ThingRowAction onPress={unfaveAction} icon="ion:heart" color="red" />
      ) : (
        <ThingRowAction onPress={makeFaveAction} icon="ion:heart-outline" />
      )}
    </PressableSpring>
  );
}

type IconActionProps = {
  onPress: () => void | Promise<void>;
  icon: string;
  color?: string;
};

const ThingRowAction = (props: IconActionProps) => {
  const {onPress, icon, color = 'gray'} = props;
  return (
    <PressableSpring onPress={onPress} style={{alignSelf: 'center'}}>
      <Icon name={icon} color={color} size={30} />
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
  image: {
    width: 60,
    height: 60,
    borderRadius: 7,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});
