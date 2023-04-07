/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import {dataApi} from '@toolkit/core/api/DataApi';
import {User, requireLoggedInUser} from '@toolkit/core/api/User';
import {useDataStore} from '@toolkit/data/DataStore';
import {Fave, Thing} from './DataTypes';

// Cilent business logic

/**
 * Get all of the things the app knows about
 */
export const GetThings = dataApi<void, Thing[]>('things.get', () => {
  const user = requireLoggedInUser<User>();
  const thingStore = useDataStore(Thing);

  return async function getAllThings() {
    const things = await thingStore.getAll();

    // Alphabetize
    things.sort((thing1, thing2) => thing1.name.localeCompare(thing2.name));

    return things;
  };
});

/**
 * Get all favorites for a user.
 */
export const GetFaves = dataApi<void, Fave[]>('getFaves', () => {
  const user = requireLoggedInUser<User>();
  const faveStore = useDataStore(Fave);

  return async function getFaves() {
    return await faveStore.getMany({
      query: {
        where: [{field: 'user', op: '==', value: user.id}],
      },
      edges: [Thing],
    });
  };
});

/**
 * Add a new favorite to a given thingID.
 */
export const AddFave = dataApi<string, Fave>('addFave', () => {
  const user = requireLoggedInUser<User>();
  const thingStore = useDataStore(Thing);
  const faveStore = useDataStore(Fave);

  return async (thingId: string) => {
    const thing = await thingStore.get(thingId);
    if (!thing) {
      throw Error(`Thing with ID ${thingId} does not exist`);
    }

    const existing = await faveStore.getMany({
      query: {
        where: [
          {field: 'user', op: '==', value: user.id!},
          {field: 'thing', op: '==', value: thingId},
        ],
      },
    });
    if (existing.length > 0) {
      return existing[0];
    }

    const fave = await faveStore.create({
      user,
      thing,
    });

    return (await faveStore.get(fave.id, {
      edges: [User, Fave],
    }))!;
  };
});

/**
 * Add a new thing
 */
export const AddThing = dataApi<Partial<Thing>, string>('addThing', () => {
  const user = requireLoggedInUser<User>();
  const thingStore = useDataStore(Thing);
  return async (thing: Partial<Thing>) => {
    const result = await thingStore.create(thing);
    return result.id;
  };
});

/**
 * Delete a thing and associated faves
 */
export const RemoveThing = dataApi<string, void>('removeThing', () => {
  const faveStore = useDataStore(Fave);
  const thingStore = useDataStore(Thing);

  return async function removeThing(thingId: string) {
    // Delete fave edgers
    const faves = await faveStore.getMany({
      query: {
        where: [{field: 'thing', op: '==', value: thingId}],
      },
    });
    const faveDeletes = faves.map(fave => faveStore.remove(fave.id));
    await Promise.all(faveDeletes);

    // Delete the thing itself
    await thingStore.remove(thingId);
  };
});
