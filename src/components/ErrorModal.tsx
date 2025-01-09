import {FC, useCallback, useEffect, useState} from 'react';
import {useOutsideClick} from '@/hooks/useOutsideClick';
import {Button} from '@nextui-org/button';
import Link from 'next/link';


interface ErrorModalProps {
  text: string;
  onExit?: () => void;
  showModal?: boolean;
}

const ErrorModal: FC<ErrorModalProps> = ({
  text,
  onExit,
  showModal
}) => {
  const ref = useOutsideClick(() => handleExit());
  const [currentShowModal, setCurrentShowModal] = useState<boolean>(showModal ?? true);

  const handleExit = useCallback(() => {
    if (onExit) onExit();
    setCurrentShowModal(false);
  }, [onExit]);

  useEffect(() => {
    function handleEscapeKeyDown(event: KeyboardEvent) {
      if (event.code === 'Escape') {
        event.preventDefault();
        handleExit();
      }
    }

    setTimeout(() => document.addEventListener('keydown', handleEscapeKeyDown));

    return () => document.removeEventListener('keydown', handleEscapeKeyDown);
  }, [handleExit]);

  useEffect(() => {
    setCurrentShowModal(showModal ?? true);
  }, [showModal]);

  if (!currentShowModal) return null;

  return (
    <div className='modal-backdrop'>
      <div ref={ref} className='modal-style border-red-600 bg-red-300'>
        <div className='text-center'>
          <h3 className='top-title-style'> Ojsann... </h3>
          <p className='group-content-style mt-3 whitespace-pre-wrap'>
            {text}<br/>Kontakt tekst-teamet
            <Link href='https://sd.nb.no' className='text-blue-600 font-bold' target='_blank'> her </Link>
            dersom problemet vedvarer.
          </p>
          <div className='flex flex-row justify-evenly'>
            <Button
              type='button'
              size='lg'
              className='abort-button-style mt-5'
              onPress={() => handleExit()}
            >
              Lukk
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
