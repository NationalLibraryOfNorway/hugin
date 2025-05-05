import React, { FC, ReactNode } from 'react';
import Modal from '@/components/ui/Modal';
import { FaInfoCircle } from 'react-icons/fa';

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
  showModal = true
}) => {
  const handleClose = () => {
    if (onExit) onExit();
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title={header}
      contentClassName="modal-style border-gray-600 bg-gray-100"
      secondaryActionText="Lukk"
      onSecondaryAction={handleClose}
    >
      <div className="flex items-center justify-center flex-col">
        <div className="rounded-full bg-blue-100 p-3 mb-4">
          <FaInfoCircle className="text-blue-500" size={24} />
        </div>
        <div className="group-content-style mt-3 whitespace-pre-wrap text-center">
          {content}
        </div>
      </div>
    </Modal>
  );
};

export default InfoModal;