import {FC, useCallback, useEffect} from 'react';
import {Button} from '@nextui-org/button';
import {useOutsideClick} from '@/hooks/useOutsideClick';

interface SuccessModalProps {
  text: string;
  buttonText?: string;
  buttonOnClick?: () => void;
  onExit?: () => void;
  showModal?: boolean;
}

const SuccessModal: FC<SuccessModalProps> = ({
  text,
  buttonText,
  buttonOnClick,
  onExit,
  showModal
}) => {
  const ref = useOutsideClick(() => handleExit());

  const handleExit = useCallback(() => {
    if (onExit) onExit();
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

  if (showModal === false) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center">
      <div ref={ref} className="p-8 border w-96 rounded bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900"> {text} </h3>
          {buttonText &&
            <Button
              type='button'
              size='lg'
              className="abort-button-style mt-5"
              onClick={() => {buttonOnClick && buttonOnClick();}}
            >
              {buttonText}
            </Button>
          }
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
