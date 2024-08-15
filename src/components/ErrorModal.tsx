import {FC, useCallback, useEffect, useState} from 'react';
import {useOutsideClick} from '@/hooks/useOutsideClick';
import {Button} from '@nextui-org/button';


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
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center z-40'>
      <div ref={ref} className='p-8 border border-red-600 w-1/3 rounded bg-red-300 z-50'>
        <div className='text-center'>
          <h3 className='top-title-style'> Ojsann... </h3>
          <p className='group-content-style mt-3 whitespace-pre-wrap'>
            {text}<br/>Kontakt tekst-teamet dersom problemet vedvarer.
          </p>
          <div className='flex flex-row justify-evenly'>
            <Button
              type='button'
              size='lg'
              className='abort-button-style mt-5'
              onClick={() => handleExit()}
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
