'use client';

import {Autocomplete, AutocompleteItem} from '@nextui-org/autocomplete';
import {useAsyncList} from '@react-stately/data';
import {useRouter} from 'next/navigation';
import {Key} from 'react';
import {searchNewspaperTitlesInCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import ActiveLabel from '@/components/ActiveLabel';

export default function SearchBar(props: {inHeader: boolean}) {
  const router = useRouter();

  function sortTitlesByFilterMatch(titles: CatalogTitle[], filter: string): CatalogTitle[] {
    return [...titles].sort((a, b) => {
      const aIndex = a.name.toLowerCase().indexOf(filter.toLowerCase());
      const bIndex = b.name.toLowerCase().indexOf(filter.toLowerCase());
      if (aIndex === 0 && bIndex !== 0) {
        return -1;
      }
      if (aIndex !== 0 && bIndex === 0) {
        return 1;
      }
      if (!a.endDate && b.endDate) {
        return -1;
      }
      if (a.endDate && !b.endDate) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  const titles = useAsyncList<CatalogTitle>({
    async load({signal, filterText}) {
      if (!filterText) {
        return {items: []};
      }
      let data = await searchNewspaperTitlesInCatalog(filterText, signal);
      data = sortTitlesByFilterMatch(data, filterText);

      return { items: data };
    }
  });

  const onSelectionChange = (key: Key | null) => {
    const selectedTitle = titles.items.find(title => title.catalogueId === key)?.name;
    if (key) {
      document.getElementById('searchBarField')?.blur();
      titles.setFilterText('');
      router.push(`/${key.toString()}/?title=${selectedTitle}`);
    }
  };

  return (
    <Autocomplete
      id='searchBarField'
      className='min-w-80'
      size={props.inHeader ? 'md' : 'lg'}
      autoFocus={!props.inHeader}
      menuTrigger="focus"
      radius="full"
      inputValue={titles.filterText}
      isLoading={titles.isLoading}
      items={titles.items}
      variant="bordered"
      label="Søk etter avistittel"
      onSelectionChange={key => onSelectionChange(key)}
      onInputChange={value => titles.setFilterText(value)}
      selectorIcon={null}
      listboxProps={{
        hideEmptyContent: true
      }}
      allowsEmptyCollection={false}
      allowsCustomValue={true}
      onKeyDown={e => {
        if ('continuePropagation' in e) {
          e.continuePropagation();
        }
      }}
    >
      {(title: CatalogTitle) =>
        <AutocompleteItem
          key={title.catalogueId}
          textValue={title.name}
          endContent={!title.endDate && <ActiveLabel/>}
          hideSelectedIcon={true}
          classNames={!title.endDate ? {base: 'bg-green-300 bg-opacity-45'} : {}}
        >
          <div className={
            (!title.endDate) ? 'font-extrabold py-1 px-2 rounded-lg' : 'text-gray-600 py-1 px-2'
          }>
            {title.name}
          </div>
        </AutocompleteItem>}
    </Autocomplete>
  );
}
