'use client';

import {Autocomplete, AutocompleteItem} from '@nextui-org/autocomplete';
import {useAsyncList} from '@react-stately/data';
import {useRouter} from 'next/navigation';
import {Key} from 'react';

export default function SearchBar() {
  const router = useRouter();

  const titles = useAsyncList({
    async load({signal, filterText}) {
      const response = await fetch(`/api/title/search?searchTerm=${filterText}&materialType=NEWSPAPER`, {signal});
      const data = await response.json() as Title[];
      return {
        items: data.map(title => ({id: title.catalogueId, name: title.name})),
      };
    }
  });

  const onSelectionChange = (key: Key) => {
    router.push(`/${key.toString()}`);
  };

  return (
    <Autocomplete
      inputValue={titles.filterText}
      isLoading={titles.isLoading}
      items={titles.items}
      size="lg"
      variant="bordered"
      label="Søk etter avistittel"
      onSelectionChange={$key => onSelectionChange($key)}
      onInputChange={titles.setFilterText}
    >
      {item => <AutocompleteItem key={item.id} textValue={item.name}>{item.name}</AutocompleteItem>}
    </Autocomplete>
  );
}
