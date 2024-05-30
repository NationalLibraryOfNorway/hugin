/* eslint-disable @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-member-access,
  @typescript-eslint/no-unsafe-argument
  */
import {signOut} from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';

export default async function federatedLogout() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/federated-logout`);
    const data = await response.json();
    if (response.ok) {
      await signOut({ redirect: false });
      window.location.href = data.url;
      return;
    }
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
    if (error instanceof Error) {
      alert(`En feil oppstod under utlogging. Vennligst prøv igjen eller lukk nettleservinduet.\nFeilmelding: ${error.message}`);
    }
  }
}