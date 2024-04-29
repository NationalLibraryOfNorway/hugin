'use client';

import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@nextui-org/react';
import React from 'react';
import {Button} from '@nextui-org/button';

export default function Header() {
  return (
    <Navbar>
      <NavbarBrand>
        <Link className="font-bold text-inherit" href="/">Hugin</Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Button
            as={Link}
            variant="light"
            color="primary"
          >Logg inn</Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
