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

  const titles = useAsyncList<CatalogTitle>({
    async load({signal, filterText}) {
      if (!filterText) {
        return {items: []};
      }
      const data = await searchNewspaperTitlesInCatalog(filterText, signal);
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
