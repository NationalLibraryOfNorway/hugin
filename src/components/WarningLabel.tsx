import { FaExclamationTriangle } from 'react-icons/fa';

export default function WarningLabel(props: {text: string; className?: string}) {
  return (
    <div className={`flex items-center justify-center ${props.className}`}>
      <div className={'w-96 h-16 bg-warning/25 rounded-2xl font-bold flex flex-row items-center justify-center'}>
        <FaExclamationTriangle className='mr-2.5' size={18}/>
        <h4>{props.text}</h4>
      </div>
    </div>
  );
}
