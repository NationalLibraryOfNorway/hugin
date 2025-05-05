import React from 'react';
import AccessibleButton from '@/components/ui/AccessibleButton';

interface SuccessAlertProps {
  message: string;
  onClick: () => void;
}

const SuccessAlert = ({ message, onClick }: SuccessAlertProps) => {
  return (
    <div className='my-2.5 px-2.5 py-1 border-green-500 bg-green-100 border-1 rounded-xl flex justify-between'>
      <p className='text-green-900 p-2'>{ message }</p>
      <AccessibleButton
        type="button"
        className="text-green-900"
        onClick={onClick}
      >
        x
      </AccessibleButton>
    </div>
  );
};

export default SuccessAlert;