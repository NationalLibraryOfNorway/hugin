import {contact_info, title} from '@prisma/client';

export interface TitleContactInfo {
  title: title;
  contactInfo: contact_info[];
}