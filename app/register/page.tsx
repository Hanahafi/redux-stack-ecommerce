'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setToken } from '../../store/slices/authSlice';
import { Button, Input, Select, SelectItem, Card, CardBody, CardHeader, Link } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Logo from '../../components/Logo';

export default function Register() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      console.log('Submitting registration form...');
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await response.json();
      console.log('Registration response:', data);
      if (response.ok) {
        console.log('Registration successful:', data);
        dispatch(setUser(data.user));
        dispatch(setToken(data.token));
        localStorage.setItem('token', data.token);
        document.cookie = `token=${data.token}; path=/; max-age=86400; samesite=strict; secure`;
        
        console.log('User role:', data.user.role);
        const dashboardPath = `/${data.user.role}/dashboard`;
        console.log('Navigating to:', dashboardPath);
        router.push(dashboardPath);
      } else {
        console.error('Registration failed:', data.message);
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
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
          <h1 className="text-2xl font-bold">Register</h1>
        </CardHeader>
        <CardBody>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <SelectItem key="buyer" value="buyer">Buyer</SelectItem>
              <SelectItem key="seller" value="seller">Seller</SelectItem>
            </Select>
            <Button type="submit" color="primary" fullWidth isLoading={isLoading}>
              Register
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
