/* eslint-disable @typescript-eslint/naming-convention */
import React, {ChangeEvent, FC} from 'react';
import {Field, FieldArray} from 'formik';
import {TitleContactInfo} from '@/models/TitleContactInfo';
import {FaCircleMinus} from 'react-icons/fa6';
import {Button} from '@nextui-org/button';

interface ContactInformationProps {
  values: TitleContactInfo;
  handleChange: (e: ChangeEvent) => void;
  handleBlur: (e: FocusEvent) => void;
  handleRemove: (values: TitleContactInfo, index: number) => void;
  handleAdd: (values: TitleContactInfo, type: 'email' | 'phone') => void;
  className?: string;
}

const ContactInformationForm: FC<ContactInformationProps> = ({values, handleChange, handleBlur, handleAdd, handleRemove, className}) => {

  return (
    <div className={className}>
      <p className='group-title-style mb-2 text-left'>Kontaktinformasjon</p>
      <label htmlFor='vendor' className='group-subtitle-style mb-1 self-start'> Avleverer </label>
      <Field
        type='text'
        id='title.vendor'
        autoFocus
        className='input-text-style mb-3'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.title.vendor ?? ''}
      />

      <label htmlFor='contact_name' className='group-subtitle-style mb-1 self-start'> Navn </label>
      <Field
        type='text'
        id='title.contact_name'
        className='input-text-style mb-3'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.title.contact_name ?? ''}
      />

      <FieldArray
        name="phone"
        render={ () => (
          <>
            <label className='group-subtitle-style mb-1 self-start'>Telefon</label>
            {values.contactInfo.map((contact, index) => (
              contact.contact_type === 'phone' && (
                <div key={index} className='flex flex-col'>

                  <div>
                    <div className='flex flex-row mb-3'>
                      <Field
                        type='text'
                        id={`contactInfo[${index}].contact_value`}
                        className='input-text-style'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={contact.contact_value ?? ''}
                      />
                      <button
                        type="button"
                        className="row-action-button-style"
                        onClick={() => handleRemove(values, index)}
                      >
                        <FaCircleMinus size={24} className='text-blue-500'/>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ))}
            <Button
              type="button"
              variant="light"
              color="primary"
              className='text-md'
              onClick={() => handleAdd(values, 'phone')}
            >
              + Legg til telefon
            </Button>
          </>
        )}
      />

      <FieldArray
        name="email"
        render={ () => (
          <>
            <label className='group-subtitle-style mb-1 self-start'>E-post</label>
            {values.contactInfo.map((contact, index) => (
              contact.contact_type === 'email' && (
                <div key={index} className='flex flex-col'>
                  <div>
                    <div className='flex flex-row mb-3'>
                      <Field
                        type='text'
                        id={`contactInfo[${index}].contact_value`}
                        className='input-text-style'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={contact.contact_value ?? ''}
                      />
                      <button
                        type="button"
                        className="row-action-button-style"
                        onClick={() => handleRemove(values, index)}
                      >
                        <FaCircleMinus size={24} className='text-blue-500'/>
                      </button>
                    </div>
                  </div>
                </div>
              )
            ))}
            <Button
              type="button"
              variant="light"
              color="primary"
              className="text-md"
              onClick={() => handleAdd(values, 'email')}
            >
              + Legg til e-post
            </Button>
          </>
        )}
      />
    </div>
  );
};

export default ContactInformationForm;