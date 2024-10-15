'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";

interface Order {
  id: number;
  order_date: string;
  total_price: number;
  status: string;
  product_name: string;
  quantity: number;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/buyer/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('An unexpected error occurred');
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <p>You haven&apos;t placed any orders yet.</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="mb-8">
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Order #{order.id}</h2>
              <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
              <p>Status: {order.status}</p>
              <p>Total: ${order.total_price.toFixed(2)}</p>
              <Table aria-label="Order items">
                <TableHeader>
                  <TableColumn>Item</TableColumn>
                  <TableColumn>Quantity</TableColumn>
                  <TableColumn>Price</TableColumn>
                </TableHeader>
                <TableBody>
                  <TableRow key={order.id}>
                    <TableCell>{order.product_name}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>${order.total_price.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}
