// eslint-disable-next-line @stylistic/max-len
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {signOut} from 'next-auth/react';

export default async function federatedLogout() {
  try {
    const response = await fetch('/hugin/api/auth/federated-logout');
    const data = await response.json();
    if (response.ok) {
      await signOut({ redirect: false });
      window.location.href = data.url;
      return;
    }
  } catch (error) {
    console.log(error);
    alert(error);
    await signOut({ redirect: false });
    window.location.href = '/';
  }
}