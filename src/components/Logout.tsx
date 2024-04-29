'use client';

import federatedLogout from '@/utils/federatedLogout';

export default function Logout() {

  return (
    <button
      type="button"
      onClick={() => void federatedLogout()}>
        Logg ut
    </button>
  );
}