'use client';

import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@nextui-org/react';
import React from 'react';
import {Button} from '@nextui-org/button';
import {useRouter} from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <Navbar>
      <NavbarBrand>
        <Link
          color="foreground"
          className="font-bold text-2xl hover:cursor-pointer"
          onClick={() => router.push('/')}
        >
            Hugin
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
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
