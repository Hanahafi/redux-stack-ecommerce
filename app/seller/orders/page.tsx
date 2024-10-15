'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Card, CardHeader, CardBody } from '@nextui-org/react';

interface Order {
  id: number;
  buyer_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  order_date: string;
  product_name: string;
}

export default function SellerOrders() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/seller/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Order History</h1>
      <Card>
        <CardHeader>Recent Orders</CardHeader>
        <CardBody>
          <Table aria-label="Orders table">
            <TableHeader>
              <TableColumn>Order ID</TableColumn>
              <TableColumn>Product</TableColumn>
              <TableColumn>Quantity</TableColumn>
              <TableColumn>Total Price</TableColumn>
              <TableColumn>Order Date</TableColumn>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.product_name}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>${order.total_price}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
