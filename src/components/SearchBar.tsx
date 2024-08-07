'use client';

import {Autocomplete, AutocompleteItem} from '@nextui-org/autocomplete';
import {useAsyncList} from '@react-stately/data';
import {useRouter} from 'next/navigation';
import {Key} from 'react';
import {searchNewspaperTitlesInCatalog} from '@/services/catalog.data';
import {SimpleTitle, toSimpleTitle} from '@/models/CatalogTitle';

export default function SearchBar(props: {inHeader: boolean}) {
  const router = useRouter();

  const titles = useAsyncList<SimpleTitle>({
    async load({signal, filterText}) {
      if (!filterText) {
        return {items: []};
      }
      const data = await searchNewspaperTitlesInCatalog(filterText, signal);
      return {
        items: data.map(title => toSimpleTitle(title)),
      };
    }
  });

  const onSelectionChange = (key: Key | null) => {
    const selectedTitle = titles.items.find(title => title.id === key)?.name;
    key && router.push(`/${key.toString()}/?title=${selectedTitle}`);
  };

  return (
    <Autocomplete
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
      {(title: SimpleTitle) =>
        <AutocompleteItem key={title.id} textValue={title.name}>
          {title.name}
        </AutocompleteItem>}
    </Autocomplete>
  );
}
