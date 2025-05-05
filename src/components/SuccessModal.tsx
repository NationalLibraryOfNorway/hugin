import React, { FC } from 'react';
import Modal from '@/components/ui/Modal';
import { FaCheck } from 'react-icons/fa';

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
  showModal = true
}) => {
  const handleClose = () => {
    if (onExit) onExit();
  };

  const handleAction = () => {
    if (buttonOnClick) buttonOnClick();
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      contentClassName="w-96"
      primaryActionText={buttonText}
      onPrimaryAction={buttonText ? handleAction : undefined}
    >
      <div className="flex items-center justify-center flex-col">
        <div className="rounded-full bg-green-100 p-3 mb-4">
          <FaCheck className="text-green-500" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 text-center">
          {text}
        </h3>
      </div>
    </Modal>
  );
};

export default SuccessModal;