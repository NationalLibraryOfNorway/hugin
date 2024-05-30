'use client';

import {signIn} from 'next-auth/react';
import {Button} from '@nextui-org/button';
import {Link} from '@nextui-org/react';

export default function Login() {
  return (
    <Button
      as={Link}
      onClick={() => void signIn('keycloak')}
      variant="light"
      color="primary"
    >Logg inn</Button>
  );
}