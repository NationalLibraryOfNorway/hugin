import React from 'react';
import Header from '@/components/Header';

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col text-center">
      <Header />
      <div className="flex-grow h-screen flex justify-center pt-10">
        {children}
      </div>
      <footer className="py-3">
        <p className="text-sm ">Nasjonalbiblioteket &copy; 2024</p>
      </footer>
    </div>
  );
}