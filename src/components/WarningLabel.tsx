import {IoWarningOutline} from 'react-icons/io5';

export default function WarningLabel(props: {text: string; className?: string}) {
  return (
    <div className={`flex items-center justify-center ${props.className}`}>
      <div className={'w-96 h-16 bg-yellow-300 rounded-2xl font-bold flex flex-row items-center justify-center'}>
        <IoWarningOutline color={'black'} size={'lg'} className={'w-fit p-1'}/>
        <h4>{props.text}</h4>
      </div>
    </div>
  );
}
