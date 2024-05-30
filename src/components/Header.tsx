'use client';

import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@nextui-org/react';
import React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import Image from 'next/image';

export default function Header({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const pathname = usePathname() || '';
  const titlepageRegex = /^\/\d+$/;

  return (
    <Navbar maxWidth='xl'>
      <NavbarBrand>
        <Link
          color="foreground"
          className="font-bold text-2xl hover:cursor-pointer"
          onClick={() => router.push('/')}
        >
          <Image className="mr-2" src="/hugin/hugin.svg" alt="Hugin logo" width={45} height={45}/>
          Hugin
        </Link>
      </NavbarBrand>
      { titlepageRegex.test(pathname) &&
      <NavbarContent justify="center">
        <NavbarItem className="lg:flex">
          <SearchBar inHeader={true}/>
        </NavbarItem>
      </NavbarContent> }
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          {children}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
