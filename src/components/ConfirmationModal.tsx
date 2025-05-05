import React, {FC, useCallback, useState} from 'react';
import Modal from '@/components/ui/Modal';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Spinner } from '@nextui-org/react';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    if (onExit) onExit();
    setIsLoading(false);
  }, [onExit]);

  const handleConfirmClick = useCallback(() => {
    if (buttonOnClick) {
      setIsLoading(true);
      // Using void to explicitly indicate we're ignoring the promise
      void buttonOnClick().finally(() => {
        setIsLoading(false);
      });
    } else {
      handleClose();
    }
  }, [buttonOnClick, handleClose]);


  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title={header}
      contentClassName="border border-blue-400 rounded-xl bg-white"
      primaryActionText={buttonText}
      onPrimaryAction={buttonText ? handleConfirmClick : undefined}
      secondaryActionText="Avbryt"
    >
      <div className="flex items-center justify-center flex-col">
        <div className="rounded-full bg-yellow-100 p-3 mb-4">
          <FaExclamationTriangle className="text-yellow-500" size={24} />
        </div>
        <div className="group-content-style mt-3 whitespace-pre-wrap text-center">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Spinner size="lg" />
            </div>
          ) : (
            text
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;