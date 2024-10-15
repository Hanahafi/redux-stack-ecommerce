'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, User } from "@nextui-org/react";
import { logout, setToken } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('SellerLayout - User:', user);
    console.log('SellerLayout - Token:', token);
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      console.log('SellerLayout - Setting token from localStorage');
      dispatch(setToken(storedToken));
    }

    if (!storedToken && !token) {
      console.log('SellerLayout - No token, redirecting to login');
      router.push('/login');
    } else if (user && user.role !== 'seller') {
      console.log('SellerLayout - User is not a seller, redirecting to dashboard');
      router.push('/dashboard');
    } else {
      console.log('SellerLayout - Setting isLoading to false');
      setIsLoading(false);
    }
  }, [user, token, router, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== 'seller') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isBordered>
        <NavbarBrand>
          <p className="font-bold text-inherit">Seller Dashboard</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/seller/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/seller/products" className="text-blue-600 hover:underline">
              Products
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/seller/orders" className="text-blue-600 hover:underline">
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
