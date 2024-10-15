'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, User, Badge } from "@nextui-org/react";
import { logout, setToken } from '../../store/slices/authSlice';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/LoadingSpinner';
import Logo from '../../components/Logo';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      dispatch(setToken(storedToken));
    }

    if (!storedToken && !token) {
      router.push('/login');
    } else if (user === null) {
      setIsLoading(true);
    } else if (user.role !== 'buyer') {
      router.push('/dashboard');
    } else {
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

  if (!user || user.role !== 'buyer') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isBordered>
        <NavbarBrand>
          <Link href="/buyer/dashboard">
            <Logo />
          </Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/buyer/dashboard" className="text-blue-600 hover:underline">
              Products
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/buyer/orders" className="text-blue-600 hover:underline">
              My Orders
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <Link href="/buyer/cart">
              <Badge content={cartItems.length} color="primary">
                <ShoppingCartIcon className="h-6 w-6 text-gray-500" />
              </Badge>
            </Link>
          </NavbarItem>
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
