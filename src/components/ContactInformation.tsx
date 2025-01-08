import React from 'react';
import {contact_info} from '@prisma/client';

interface ContactInformationProps {
  vendor?: string | null;
  contactName?: string | null;
  contactInformation?: contact_info[] | null;
}

const ContactInformation = (props: ContactInformationProps) => {

  const phoneNumbers = props.contactInformation?.filter(c => c.contact_type === 'phone');
  const emails = props.contactInformation?.filter(c => c.contact_type === 'email');

  return (
    <>
      {props.vendor && (
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">Avleverer: </p>
          <p className="group-content-style ml-3">{props.vendor}</p>
        </div>
      )}

      {props.contactName &&(
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">Kontaktperson: </p>
          <p className="group-content-style ml-3">{props.contactName}</p>
        </div>
      )}

      {phoneNumbers && phoneNumbers.length > 0 && (
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">Telefonnummer</p>
          <p className="group-content-style ml-3">
            {phoneNumbers.map((contact, index) => (
              <span key={index}>
                {contact.contact_value}
                {index < phoneNumbers.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}

      {emails && emails.length > 0 && (
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">{emails.length > 1 ? 'E-postadresser' : 'E-postadresse'}</p>
          <p className="group-content-style ml-3">
            {emails.map((contact, index) => (
              <span key={index}>
                {contact.contact_value}
                {index < emails.length - 1 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      )}
    </>
  );
};

export default ContactInformation;