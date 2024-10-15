'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Card, CardBody, CardHeader, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import Link from 'next/link';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function AdminDashboard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statistics, setStatistics] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized to fetch products');
        }
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    }
  }, [token]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/statistics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchProducts();
      fetchStatistics();
    }
  }, [user, fetchUsers, fetchProducts, fetchStatistics]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!user || user.role !== 'admin') {
    return <div className="text-center p-4">Access Denied. You must be an admin to view this page.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardBody>
            <p className="text-2xl font-bold">{statistics.totalUsers}</p>
            <p>Total Users</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-2xl font-bold">{statistics.totalProducts}</p>
            <p>Total Products</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-2xl font-bold">{statistics.totalOrders}</p>
            <p>Total Orders</p>
          </CardBody>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Users</h2>
          <Link href="/admin/users/new">
            <Button color="primary">Add New User</Button>
          </Link>
        </CardHeader>
        <CardBody>
          {users.length > 0 ? (
            <Table aria-label="Users table">
              <TableHeader>
                <TableColumn>Username</TableColumn>
                <TableColumn>Email</TableColumn>
                <TableColumn>Role</TableColumn>
              </TableHeader>
              <TableBody>
                {users.slice(0, 5).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center p-4">No users available.</p>
          )}
          <div className="mt-4">
            <Link href="/admin/users">
              <Button color="primary">View All Users</Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Products</h2>
          <Link href="/admin/products">
            <Button color="primary">View All Products</Button>
          </Link>
        </CardHeader>
        <CardBody>
          {products.length > 0 ? (
            <Table aria-label="Products table">
              <TableHeader>
                <TableColumn>Name</TableColumn>
                <TableColumn>Price</TableColumn>
                <TableColumn>Quantity</TableColumn>
              </TableHeader>
              <TableBody>
                {products.slice(0, 5).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center p-4">No products available.</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
