import * as React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useDataStore} from '@toolkit/data/DataStore';
import {useComponents} from '@toolkit/ui/components/Components';
import {Icon} from '@toolkit/ui/components/Icon';
import {PressableSpring} from '@toolkit/ui/components/Tools';
import {Thing} from '@app/common/DataTypes';

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

const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json';
const FIELDS =
  'fields=key,title,author_name,readinglog_count,id_amazon,id_goodreads,cover_i';

function openLibraryMatcher(match: string, type: string) {
  const typeParam = type === '*' ? '' : `${type}:`;
  return `${typeParam}(${match}*) OR ${typeParam}(${match})`;
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

export function formatAuthor(author: string | string[]) {
  if (author == null) {
    return '';
  }
  if (typeof author === 'string') {
    return author;
  }
  return author.join(', ');
}

function imageSource(item: OpenLibraryResult) {
  return {uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`};
}

type Props = {
  onAdd: (toAdd: Thing) => void | Promise<void>;
};

export const SearchBar = (props: Props) => {
  // TODO: filter out existing faves when on faves screen
  const {onAdd} = props;
  const {Body, Button} = useComponents();
  const [matches, setMatches] = React.useState<OpenLibraryResult[]>([]);
  const requestCounter = React.useRef(0);
  const thingStore = useDataStore(Thing);
  const [value, setValue] = React.useState('');

  /*
  Comment out to have default data for easy testing
  React.useEffect(() => {
    onNewText('Altered carbon');
  }, []);
  */

  async function onNewText(newValue: string) {
    setValue(newValue);
    if (newValue === '') {
      setMatches([]);
      return;
    }
    requestCounter.current = requestCounter.current + 1;
    const id = requestCounter.current;

    const [top, all] = await Promise.all([
      openLibraryMatches(newValue, false),
      openLibraryMatches(newValue, true),
    ]);

    if (requestCounter.current !== id) {
      // Another reuqest was sent while in flight, so don't update value
      return;
    }

    const topIds = top.map(t => t.key);
    const filteredAll = all.filter(t => !topIds.includes(t.key));
    const docs = [
      ...bestMatches(newValue, top),
      ...bestMatches(newValue, filteredAll),
    ];

    setMatches(docs.slice(0, 6));
  }

  async function getOrCreateThing(from: OpenLibraryResult) {
    let thing;
    let existing = await thingStore.getMany({
      query: {where: [{field: 'externalId', op: '==', value: from.key}]},
    });
    if (existing.length > 0) {
      console.log('found it!');
      thing = existing[0];
    } else {
      thing = await thingStore.create({
        name: from.title,
        description: 'by ' + formatAuthor(from.author_name),
        type: 'book',
        image: `https://covers.openlibrary.org/b/id/${from.cover_i}-L.jpg`,
        thumb: `https://covers.openlibrary.org/b/id/${from.cover_i}-M.jpg`,
        externalId: from.key,
        externalType: 'openlibrary',
      });
    }
    return thing;
  }

  async function addFave(toAdd: OpenLibraryResult) {
    const thing = await getOrCreateThing(toAdd);
    setValue('');
    setMatches([]);
    await onAdd(thing);
  }

  return (
    <View style={S.searchStuff}>
      <SearchInput value={value} onNewText={onNewText} />
      <View>
        <View style={S.autocompletes}>
          {matches.map((match, idx) => (
            <View key={idx} style={S.autocomplete}>
              <Image source={imageSource(match)} style={S.thumb} />
              <View style={{flexShrink: 1, flexGrow: 1}}>
                <Body numberOfLines={1} style={{fontWeight: 'bold'}}>
                  {match.title}
                </Body>
                <Body numberOfLines={1}>
                  {formatAuthor(match.author_name)} ({match.readinglog_count}|
                  {match.id_amazon != null ? '+' : '-'}|
                  {match.id_goodreads != null ? '+' : '-'})
                </Body>
              </View>
              <Button
                onPress={() => addFave(match)}
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
