'use client';

import { NextUIProvider } from '@nextui-org/react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../store';
import { AuthLoader } from './AuthLoader';
import { useAuthToken } from '../hooks/useAuthToken';

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthToken();
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <NextUIProvider>
        <AuthProvider>
          <AuthLoader />
          {children}
        </AuthProvider>
      </NextUIProvider>
    </ReduxProvider>
  );
}
