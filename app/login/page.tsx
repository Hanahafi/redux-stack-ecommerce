'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/authSlice';
import { Button, Input, Card, CardBody, CardHeader, Link } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';

export default function Login() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (response.ok) {
        dispatch(setUser(data.user));
        dispatch(setToken(data.token));
        localStorage.setItem('token', data.token);
        document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=strict; secure`;
        
        console.log('User role:', data.user.role);
        const dashboardPath = `/${data.user.role}/dashboard`;
        console.log('Navigating to:', dashboardPath);
        router.push(dashboardPath);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
      <Card className="w-96 shadow-xl">
        <CardHeader className="flex flex-col items-center pb-0">
          <Logo />
          <h1 className="text-2xl font-bold">Login</h1>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" color="primary" fullWidth isLoading={isLoading}>
              Login
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link href="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
