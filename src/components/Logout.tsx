'use client';

import federatedLogout from '@/utils/federatedLogout';
import {Button} from '@nextui-org/button';

export default function Logout() {

  return (
    <Button
      onClick={() => void federatedLogout()}
      className="edit-button-style"
    >
      Logg ut
    </Button>
  );
}