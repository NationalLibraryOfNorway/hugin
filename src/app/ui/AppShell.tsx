'use client';

import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@nextui-org/react';
import React from 'react';
import {Divider} from '@nextui-org/divider';

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col">
      <Navbar>
        <NavbarBrand>
          <p className="font-bold text-inherit">Hugin</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="#">Logg inn</Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <Divider />
      <main className="flex-grow text-center">
        {children}
      </main>
      <Divider />
      <footer className="text-center">
        <p>Nasjonalbiblioteket &copy; 2024</p>
      </footer>
    </div>
  );
}