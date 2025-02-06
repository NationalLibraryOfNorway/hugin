import {IoMdLock} from 'react-icons/io';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center max-h-screen">
      <div className="flex items-center space-x-4">
        <IoMdLock className="fill-red-700 w-52 h-52" />
        <div className="text-7xl">
          Du har ikke tilgang!
        </div>
      </div>
      <div className="text-2xl pl-14 -mt-12">
        Ta kontakt med Tekst-teamet -&nbsp;
        <a className="text-blue-500 font-bold underline"
          href="mailto:tekst@nb.no?subject=Tilgang til Hugin&body=Jeg vil ha tilgang fordi..."
        >
          Send mail
        </a>
      </div>
    </div>
  );
}
