import {FC, ReactNode, useCallback, useEffect, useState} from 'react';
import {useOutsideClick} from '@/hooks/useOutsideClick';
import {Button} from '@nextui-org/button';

interface InfoModalProps {
  header: string;
  content: ReactNode;
  onExit?: () => void;
  showModal?: boolean;
}

const InfoModal: FC<InfoModalProps> = ({
  header,
  content,
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
      <div ref={ref} className='modal-style border-gray-600 bg-gray-100'>
        <div className='text-center'>
          <h3 className='top-title-style'>{header}</h3>
          <p className='group-content-style mt-3 whitespace-pre-wrap'>{content}</p>
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

export default InfoModal;
