/* eslint-disable @typescript-eslint/naming-convention */
import {ChangeEvent, FC} from 'react';
import {Field} from 'formik';

interface ContactInformationProps {
  values: {
    contact_email: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    vendor: string | null;
  };
  handleChange: (e: ChangeEvent) => void;
  handleBlur: (e: FocusEvent) => void;
  className?: string;
}

const ContactInformationForm: FC<ContactInformationProps> = ({values, handleChange, handleBlur, className}) => {
  return (
    <div className={className}>
      <p className='group-title-style mb-2 text-left'>Kontaktinformasjon</p>
      <label htmlFor='vendor' className='group-subtitle-style mb-1 self-start'> Avleverer </label>
      <Field
        type='text'
        id='vendor'
        className='input-text-style mb-3'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.vendor ?? ''}
      />

      <label htmlFor='contact_name' className='group-subtitle-style mb-1 self-start'> Navn </label>
      <Field
        type='text'
        id='contact_name'
        className='input-text-style mb-3'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.contact_name ?? ''}
      />

      <label htmlFor='contact_email' className='group-subtitle-style mb-1 self-start'> E-post </label>
      <Field
        type='text'
        id='contact_email'
        className='input-text-style mb-3'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.contact_email ?? ''}
      />

      <label htmlFor='contact_phone' className='group-subtitle-style mb-1 self-start'> Telefon </label>
      <Field
        type='text'
        id='contact_phone'
        className='input-text-style'
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.contact_phone ?? ''}
      />
    </div>
  );
};

export default ContactInformationForm;