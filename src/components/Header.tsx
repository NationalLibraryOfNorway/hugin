'use client';

import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@nextui-org/react';
import React from 'react';
import {useRouter} from 'next/navigation';

export default function Header({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <Navbar>
      <NavbarBrand>
        <Link color="foreground" className="font-bold text-inherit hover:cursor-pointer" onClick={() => router.push('/')}>Hugin</Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          {children}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
