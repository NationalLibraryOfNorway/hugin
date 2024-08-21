'use client';

import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@nextui-org/react';
import React from 'react';
import {Button} from '@nextui-org/button';
import {usePathname, useRouter} from 'next/navigation';
import SearchBar from '@/components/SearchBar';

export default function Header() {
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
        <NavbarItem className="lg:flex">
          <Button
            as={Link}
            variant="light"
            color="primary"
            className="edit-button-style"
          >
              Logg inn
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
