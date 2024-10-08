import SearchBar from '@/components/SearchBar';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="w-96 flex flex-col items-center mt-20">
      <Image className="m-5" src="/hugin/hugin.svg" alt="Hugin logo" width={128} height={128}/>
      <SearchBar inHeader={false}/>
    </div>
  );
}
