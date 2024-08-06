import {FC} from 'react';
import {Button} from '@nextui-org/button';

interface SuccessModalProps {
  text: string;
  buttonText?: string;
  buttonOnClick?: () => void;
}

const SuccessModal: FC<SuccessModalProps> = ({
  text,
  buttonText,
  buttonOnClick,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center">
      <div className="p-8 border w-96 rounded bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900"> {text} </h3>
          {buttonText &&
            <Button
              type='button'
              size='lg'
              className="bg-green-400 hover:bg-green-600 font-bold py-2 px-4 text-lg mt-5"
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
