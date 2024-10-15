'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, User } from "@nextui-org/react";
import { logout } from '../../store/slices/authSlice';
import Logo from '../../components/Logo';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else if (user === null) {
      setIsLoading(true);
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [user, token, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isBordered>
        <NavbarBrand>
          <Link href="/admin/dashboard">
            <Logo />
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/admin/users" className="text-blue-600 hover:underline">
              Users
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/admin/products" className="text-blue-600 hover:underline">
              Products
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/admin/orders" className="text-blue-600 hover:underline">
              Orders
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <User
              name={user.username}
              description={user.email}
              avatarProps={{
                src: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
              }}
            />
          </NavbarItem>
          <NavbarItem>
            <Button color="danger" variant="flat" onClick={handleLogout}>
              Log Out
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
