'use client';

import React, {FC} from 'react';
import {ErrorMessage, FieldProps, useFormikContext} from 'formik';
import {FaCircleMinus, FaCirclePlus} from 'react-icons/fa6';

interface NumberInputWithButtonsProps extends FieldProps {
  minValue?: number;
  maxValue?: number;
}

const NumberInputWithButtons: FC<NumberInputWithButtonsProps> = ({
  field,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  form, // Needed for 'field'-element to work
  minValue,
  maxValue,
  ...props
}) => {
  const { setFieldValue, getFieldProps, setFieldTouched } = useFormikContext<{ [key: string]: number }>();
  const [showCustomText, setShowCustomText] = React.useState<string | undefined>(undefined);

  const increaseValue = () => {
    const oldValue = +getFieldProps(field.name).value;
    if (maxValue === undefined || oldValue < maxValue) {
      void setFieldTouched(field.name, true);
      void setFieldValue(field.name, oldValue + 1);
      setShowCustomText(undefined);
    } else if (oldValue >= maxValue) {
      setShowCustomText(`Maksverdi nådd (${maxValue})`);
      setTimeout(() => setShowCustomText(undefined), 2000);
    }
  };

  const decreaseValue = () => {
    const oldValue = +getFieldProps(field.name).value;

    if (minValue === undefined || oldValue > minValue) {
      void setFieldTouched(field.name, true);
      void setFieldValue(field.name, oldValue - 1);
      setShowCustomText(undefined);
    } else if (oldValue <= minValue) {
      setShowCustomText(`Minimumsverdi nådd (${minValue})`);
      setTimeout(() => setShowCustomText(undefined), 2000);
    }
  };

  return (
    <div className='my-1.5'>
      <div className='flex flex-row gap-1'>
        <button
          type='button'
          onClick={decreaseValue}
        >
          <FaCircleMinus size={30} className='text-red-500 hover:text-red-700'/>
        </button>

        <input
          type='number'
          {...field}
          {...props}
        />

        <button
          type='button'
          onClick={increaseValue}
        >
          <FaCirclePlus size={30} className='text-green-700 hover:text-green-900'/>
        </button>

      </div>
      <div className='mt-1 w-full'>
        <ErrorMessage name={field.name}></ErrorMessage>
        {showCustomText && <div>{showCustomText}</div>}
      </div>
    </div>
  );
};

export default NumberInputWithButtons;
