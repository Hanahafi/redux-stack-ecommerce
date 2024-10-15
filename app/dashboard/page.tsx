'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'seller':
          router.push('/seller/dashboard');
          break;
        case 'buyer':
          router.push('/buyer/dashboard');
          break;
        default:
          router.push('/');
      }
    } else {
      router.push('/login');
    }
  }, [user, router]);

  return <LoadingSpinner />;
}
