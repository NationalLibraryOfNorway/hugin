import React, { FC } from 'react';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { ImCross } from 'react-icons/im';

interface ErrorModalProps {
  text: string;
  onExit?: () => void;
  showModal?: boolean;
}

const ErrorModal: FC<ErrorModalProps> = ({
  text,
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
      title="Ojsann..."
      contentClassName="modal-style border-red-600 bg-red-300"
      secondaryActionText="Lukk"
      onSecondaryAction={handleClose}
    >
      <div className="flex items-center justify-center flex-col">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <ImCross className="text-red-500" size={24} />
        </div>
        <div className="group-content-style mt-3 whitespace-pre-wrap text-center">
          {text}<br/>Kontakt tekst-teamet
          <Link href='https://sd.nb.no' className='text-blue-600 font-bold' target='_blank'> her </Link>
          dersom problemet vedvarer.
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;