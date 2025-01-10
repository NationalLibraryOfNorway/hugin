import {FC, useCallback, useEffect, useState} from 'react';
import {Button} from '@nextui-org/button';
import {useOutsideClick} from '@/hooks/useOutsideClick';
import {Spinner} from '@nextui-org/react';


interface ConfirmationModalProps {
  showModal: boolean;
  header: string;
  text?: string;
  buttonText?: string;
  buttonOnClick?: () => Promise<void>;
  onExit?: () => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  showModal,
  header,
  text,
  buttonText,
  buttonOnClick,
  onExit
}) => {
  const ref = useOutsideClick(() => handleExit());
  const [currentShowModal, setCurrentShowModal] = useState<boolean>(showModal ?? true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleExit = useCallback(() => {
    if (onExit) onExit();
    setCurrentShowModal(false);
    setIsLoading(false);
  }, [onExit]);

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    if (buttonOnClick)  {
      void buttonOnClick().then(() => setIsLoading(false));
    } else {
      handleExit();
    }
  }, [buttonOnClick, handleExit]);

  useEffect(() => {
    setCurrentShowModal(showModal ?? true);
  }, [showModal]);

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

  if (!currentShowModal) return null;

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center z-40'>
      <div ref={ref} className='p-8 border border-blue-400 w-2/5 rounded-xl bg-white'>
        <div className='text-center'>
          <h3 className='top-title-style'> {header} </h3>
          <p className='group-content-style mt-3 whitespace-pre-wrap'>
            {text}
          </p>
          <div className='flex flex-row justify-evenly'>
            <Button
              type='button'
              size='lg'
              className='abort-button-style mt-5'
              onClick={() => handleExit()}
            >
              Avbryt
            </Button>
            {buttonText &&
              <Button
                type='button'
                size='lg'
                className='save-button-style mt-5'
                disabled={isLoading}
                onClick={() => {
                  handleConfirm();
                }}
                endContent={isLoading ? <Spinner size={'sm'}/> : undefined}
              >
                {buttonText}
              </Button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
