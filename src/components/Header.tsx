'use client';

import {Link, Navbar, NavbarBrand, NavbarContent, NavbarItem} from '@nextui-org/react';
import React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';
import {useAuth} from '@/app/AuthProvider';
import {UserDetails} from '@/components/UserDetails';

export default function Header() {
  const { authenticated , user } = useAuth();
  const router = useRouter();

  const pathname = usePathname() || '';
  const titlepageRegex = /^\/\d+$/;

  return (
    <Navbar maxWidth='xl'>
      <NavbarBrand>
        <Link
          color="foreground"
          className="font-bold text-2xl hover:cursor-pointer"
          onPress={() => router.push('/')}
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
        <NavbarItem className="lg:flex">
          { authenticated ? (
            <>
              <UserDetails name={user?.name ?? ''} className="px-2.5"/>
              <LogoutButton/>
            </>
          ) : <></>}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
