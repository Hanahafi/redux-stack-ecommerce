'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button } from '@nextui-org/react';
import Link from 'next/link';

interface Order {
  id: number;
  buyerId: number;
  productId: number;
  quantity: number;
  totalPrice: number | null;
  orderDate: string;
  status: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error('Failed to fetch orders:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [token]);

  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Order Management</h1>
        <Link href="/admin/dashboard">
          <Button color="secondary">Back to Dashboard</Button>
        </Link>
      </div>
      <Table aria-label="Orders table">
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>Buyer ID</TableColumn>
          <TableColumn>Product ID</TableColumn>
          <TableColumn>Quantity</TableColumn>
          <TableColumn>Total Price</TableColumn>
          <TableColumn>Order Date</TableColumn>
          <TableColumn>Status</TableColumn>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.buyerId}</TableCell>
              <TableCell>{order.productId}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : 'N/A'}</TableCell>
              <TableCell>{new Date(order.orderDate).toLocaleString()}</TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
