'use client';

import {User} from '@nextui-org/user';

interface UserDetailsProps {
  name: string;
  email: string;
}

export const UserDetails: React.FC<UserDetailsProps> = ({ name, email }) => {
  const initials = name.split(' ').map(n => n[0].toUpperCase()).join('');

  return (
    <User
      name={name}
      description={email}
      avatarProps={{
        name: initials,
        isBordered: true,
      }}
    />
  );
};
