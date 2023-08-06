import * as React from 'react';
import {Image, Keyboard, StyleSheet, View} from 'react-native';
import {requireLoggedInUser} from '@toolkit/core/api/User';
import {useAction} from '@toolkit/core/client/Action';
import {useReload} from '@toolkit/core/client/Reload';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {Fave, Thing, ThingType} from '@app/common/DataTypes';
import {useMediaType} from '@app/screens/Favorites';

export type OpenLibraryResult = {
  author_name: string | string[];
  key: string;
  title: string;
  readinglog_count?: number;
  id_amazon?: string[];
  id_goodreads?: string[];
  cover_i?: number;
};

function isPrefixMatch(match: string, item: OpenLibraryResult) {
  const toMatch = match.toLowerCase().replace('the ', '');

  const author = formatAuthor(item.author_name).toLowerCase();
  const title = item.title.toLowerCase().replace('the ', '');

  return (
    author.startsWith(toMatch) ||
    toMatch.startsWith(author) ||
    title.startsWith(toMatch) ||
    toMatch.startsWith(title)
  );
}

/**
 * Gets the matches to show in autocomplete
 */
function bestMatches(match: string, from: OpenLibraryResult[]) {
  const sorted = from
    .filter(item => item.readinglog_count != null && item.readinglog_count > 1)
    .sort((a, b) => {
      const aMatch = isPrefixMatch(match, a);
      const bMatch = isPrefixMatch(match, b);
      if (aMatch && !bMatch) {
        return -1;
      } else if (bMatch && !aMatch) {
        return 1;
      }
      return (b.readinglog_count ?? 0) - (a.readinglog_count ?? 0);
    });
  return sorted;
}

type ReleaseGroup = {
  id: string;
  title: string;
  'primary-type': string;
  'secondary-types'?: string[];
  'artist-credit'?: {name: string}[];
  releases?: {title: string}[];
};

type ReleaseGroupResponse = {
  count: number;
  created: string;
  offset: number;
  'release-groups': ReleaseGroup[];
};
const MUSIC_BRAINZ_URL = 'https://musicbrainz.org/ws/2/release-group';

// TODO: Run literal match as separate query
async function musicBrainzMatches(match: string): Promise<Partial<Thing>[]> {
  if (match.length < 3) {
    return [];
  }
  const query = `${MUSIC_BRAINZ_URL}?query=(artist:${match} OR releasegroup:${match}) AND primarytype:album&fmt=json&limit=100`;
  const response = await fetch(query);
  const json = (await response.json()) as ReleaseGroupResponse;
  const results = json['release-groups'].sort(
    (a, b) => score(b, match) - score(a, match),
  );
  return results.map(r => musicBrainzToThing(r));
}

function artistFor(from: ReleaseGroup) {
  return from['artist-credit']?.[0]?.name ?? '';
}

function musicBrainzToThing(from: ReleaseGroup): Partial<Thing> {
  return {
    name: from.title,
    by: artistFor(from),
    type: 'album',
    image: `https://coverartarchive.org/release-group/${from.id}front`,
    thumb: `https://coverartarchive.org/release-group/${from.id}/front-250`,
    externalId: from.id,
    externalType: 'musicbrainz',
  };
}

function score(releaseGroup: ReleaseGroup, match: string) {
  const releases = releaseGroup.releases ? releaseGroup.releases.length : 0;
  const isAlbum = releaseGroup['secondary-types'] == null;
  const title = releaseGroup.title.toLowerCase();
  const artist = artistFor(releaseGroup).toLowerCase();
  const toMatch = match.toLowerCase();
  const exact = title === toMatch || artist === toMatch;
  const substring = title.includes(toMatch) || artist.includes(toMatch);
  return releases + (isAlbum ? 5 : 0) + (exact ? 10 : 0) + (substring ? 5 : 0);
}

const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json';
const FIELDS =
  'fields=key,title,author_name,readinglog_count,id_amazon,id_goodreads,cover_i';

function openLibraryMatcher(match: string, type: string) {
  const typeParam = type === '*' ? '' : `${type}:`;
  return `${typeParam}(${match}*) OR ${typeParam}(${match})`;
}

async function bookMatches(match: string) {
  const [top, all] = await Promise.all([
    openLibraryMatches(match, false),
    openLibraryMatches(match, true),
  ]);

  const topIds = top.map(t => t.key);
  const filteredAll = all.filter(t => !topIds.includes(t.key));
  const books = [
    ...bestMatches(match, top),
    ...bestMatches(match, filteredAll),
  ].map(doc => openLibraryToThing(doc));

  return books;
}

async function openLibraryMatches(match: string, allDocs: boolean) {
  if (match.length < 4 || (match.length < 10 && allDocs)) {
    return [];
  }

  let query;
  if (allDocs) {
    const allMatch = openLibraryMatcher(match, '*');
    query = `${OPEN_LIBRARY_URL}?q=${allMatch}&${FIELDS}`;
  } else {
    const titleMatch = openLibraryMatcher(match, 'title');
    const authorMatch = openLibraryMatcher(match, 'author');
    query = `${OPEN_LIBRARY_URL}?q=${titleMatch} OR ${authorMatch}&${FIELDS}`;
  }

  const result = await fetch(query);
  const json = await result.json();
  if (json.docs) {
    return json.docs as OpenLibraryResult[];
  }
  return [];
}

function openLibraryToThing(from: OpenLibraryResult): Partial<Thing> {
  return {
    name: from.title,
    by: formatAuthor(from.author_name),
    type: 'book',
    image: `https://covers.openlibrary.org/b/id/${from.cover_i}-L.jpg`,
    thumb: `https://covers.openlibrary.org/b/id/${from.cover_i}-M.jpg`,
    externalId: from.key,
    externalType: 'openlibrary',
  };
}
export function formatAuthor(author: string | string[]) {
  if (author == null) {
    return '';
  }
  if (typeof author === 'string') {
    return author;
  }
  return author.join(', ');
}

type Props = {};

export const SearchBar = () => {
  const mediaType = useMediaType();
  // TODO: filter out existing faves when on faves screen
  const user = requireLoggedInUser();
  const thingStore = useDataStore(Thing);
  const faveStore = useDataStore(Fave);
  const requestCounter = React.useRef(0);
  const [value, setValue] = React.useState('');
  const [matches, setMatches] = React.useState<Partial<Thing>[]>([]);
  const reload = useReload();
  const [addFave] = useAction('AddFavorite', addFaveHandler);
  const {Body, Button} = useComponents();

  async function addFaveHandler(thing: Thing) {
    await faveStore.create({user, thing});
    reload();
  }

  async function onNewText(newValue: string) {
    setValue(newValue);
    if (newValue === '') {
      setMatches([]);
      return;
    }
    requestCounter.current = requestCounter.current + 1;
    const id = requestCounter.current;

    const matches =
      mediaType === 'book'
        ? await bookMatches(newValue)
        : await musicBrainzMatches(newValue);

    if (requestCounter.current !== id) {
      // Another request was sent while in flight, so don't update value
      return;
    }

    setMatches(matches.slice(0, 6));
  }

  async function getOrCreateThing(matched: Partial<Thing>) {
    let thing;
    let existing = await thingStore.query({
      where: [{field: 'externalId', op: '==', value: matched.externalId!}],
    });
    if (existing.length > 0) {
      thing = existing[0];
    } else {
      thing = await thingStore.create(matched);
    }
    return thing;
  }

  async function itemSelected(toAdd: Partial<Thing>) {
    const thing = await getOrCreateThing(toAdd);
    setValue('');
    setMatches([]);
    await addFave(thing);
    Keyboard.dismiss();
  }

  return (
    <View style={S.searchStuff}>
      <SearchInput value={value} onNewText={onNewText} />
      <View>
        <View style={S.autocompletes}>
          {matches.map((match, idx) => (
            <View key={idx} style={S.autocomplete}>
              <Image source={{uri: match.thumb!}} style={S.thumb} />
              <View style={{flexShrink: 1, flexGrow: 1}}>
                <Body numberOfLines={1} style={{fontWeight: 'bold'}}>
                  {match.name}
                </Body>
                <Body numberOfLines={1}>{match.by ?? match.description}</Body>
              </View>
              <Button
                onPress={() => itemSelected(match)}
                type="secondary"
                style={{opacity: 0.6, marginLeft: 6}}>
                Add
              </Button>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

type SearchInputProps = {
  value: string;
  onNewText: (newValue: string) => void | Promise<void>;
};

export const SearchInput = (props: SearchInputProps) => {
  const {value, onNewText} = props;
  const {TextInput} = useComponents();

  return (
    <View style={S.searchContainer}>
      <View style={S.searchIcon}>
        <Icon name="ion:search" size={20} color="#444" />
      </View>
      {/* for now no good way to pass in the left icon, so floating it */}
      <TextInput
        type="primary"
        value={value}
        onChangeText={onNewText}
        placeholder="Search"
        style={{paddingHorizontal: 36}}
        spellCheck={false}
      />
      {value !== '' && (
        <View style={S.searchIconRight}>
          <PressableSpring onPress={() => onNewText('')}>
            <Icon name="ion:close-circle-outline" size={32} color="#808080" />
          </PressableSpring>
        </View>
      )}
    </View>
  );
};

const S = StyleSheet.create({
  searchContainer: {
    padding: 6,
    marginHorizontal: 8,
  },
  searchIcon: {
    position: 'absolute',
    zIndex: 4,
    left: 26,
    top: 30,
  },
  searchIconRight: {
    position: 'absolute',
    zIndex: 4,
    right: 20,
    top: 24,
  },
  autocompletes: {
    backgroundColor: '#FFF',
    left: 40,
    right: 40,
    top: -6,
    position: 'absolute',
    zIndex: 40,
    shadowColor: '#88A',
    shadowOffset: {width: 2, height: 3},
    shadowRadius: 4,
  },
  autocomplete: {
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#CCC',
    zIndex: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchStuff: {
    zIndex: 20,
  },
  thumb: {
    width: 48,
    height: 48,
    marginRight: 16,
    borderRadius: 4,
  },
});
