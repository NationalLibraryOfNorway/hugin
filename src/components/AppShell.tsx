import React from 'react';
import Header from '@/components/Header';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/app/lib/auth';
import Login from '@/components/Login';
import Logout from '@/components/Logout';
import {UserDetails} from '@/components/UserDetails';

export default async function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const userButton = session ? (
    <div className="flex items-center space-x-4">
      <UserDetails name={session.user.name} email={session.user.email} />
      <Logout />
    </div>
  ) : <Login />;

  return (
    <div className="min-h-screen flex flex-col text-center">
      <Header>
        {userButton}
      </Header>
      <div className="flex-grow flex justify-center pt-6">
        {children}
      </div>
      <footer className="py-3">
        <p className="text-sm ">Nasjonalbiblioteket &copy; 2024</p>
      </footer>
    </div>
  );
}
