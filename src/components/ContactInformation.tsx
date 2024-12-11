import React from 'react';

interface ContactInformationProps {
  vendor?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

const ContactInformation = (props: ContactInformationProps) => {
  return (
    <>
      {props.vendor &&
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">Avleverer: </p>
          <p className="group-content-style ml-3">{props.vendor}</p>
        </div>
      }

      {props.contactName &&
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">Kontaktperson: </p>
          <p className="group-content-style ml-3">{props.contactName}</p>
        </div>
      }

      {props.contactEmail &&
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">E-post: </p>
          <p className="group-content-style ml-3">{props.contactEmail}</p>
        </div>
      }

      {props.contactPhone &&
        <div className="self-start flex flex-row">
          <p className="group-subtitle-style">Telefon: </p>
          <p className="group-content-style ml-3">{props.contactPhone}</p>
        </div>
      }
    </>
  );
};

export default ContactInformation;