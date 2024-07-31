'use client';

import {Autocomplete, AutocompleteItem} from '@nextui-org/autocomplete';
import {useAsyncList} from '@react-stately/data';
import {useRouter} from 'next/navigation';
import {Key} from 'react';
import {searchNewspaperTitlesInCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';

export default function SearchBar() {
  const router = useRouter();

  const titles = useAsyncList({
    async load({signal, filterText}) {
      if (!filterText) {
        return {items: []};
      }
      const data = await searchNewspaperTitlesInCatalog(filterText, signal);
      return {
        items: data.map(title => ({id: title.catalogueId, name: title.name})),
      };
    }
  });

  const onSelectionChange = (key: Key | null) => {
    key && router.push(`/${key.toString()}`);
  };

  return (
    <Autocomplete
      autoFocus={true}
      menuTrigger="focus"
      radius="full"
      inputValue={titles.filterText}
      isLoading={titles.isLoading}
      items={titles.items as CatalogTitle[]}
      variant="bordered"
      label="Søk etter avistittel"
      onSelectionChange={key => onSelectionChange(key)}
      onInputChange={value => titles.setFilterText(value)}
      selectorIcon={null}
      listboxProps={{
        hideEmptyContent: true
      }}
      allowsEmptyCollection={false}
      onKeyDown={e => {
        if ('continuePropagation' in e) {
          e.continuePropagation();
        }
      }}
    >
      {(title: CatalogTitle) =>
        <AutocompleteItem key={title.catalogueId} textValue={title.name}>
          {title.name}
        </AutocompleteItem>}
    </Autocomplete>
  );
}
