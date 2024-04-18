'use client';

import {Autocomplete, AutocompleteItem} from '@nextui-org/autocomplete';

const testData = [
  {id: 1, name: 'Rana Blad'},
  {id: 2, name: 'Avisa Nordland'},
  {id: 3, name: 'Nordlys'},
  {id: 4, name: 'Finnmark Dagblad'},
  {id: 5, name: 'Fædrelandsvennen'},
  {id: 6, name: 'Stavanger Aftenblad'},
  {id: 7, name: 'Bergens Tidende'},
  {id: 8, name: 'Aftenposten'},
  {id: 9, name: 'Dagens Næringsliv'},
  {id: 10, name: 'Klassekampen'},
];
export default function SearchBar() {
  return (
    <Autocomplete
      defaultItems={testData}
      size="lg"
      variant="bordered"
      label="Søk etter avistittel"
    >
      {item => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>}
    </Autocomplete>
  );
}