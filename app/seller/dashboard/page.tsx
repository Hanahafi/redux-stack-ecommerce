'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Card, CardBody, CardHeader, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { useRouter } from 'next/navigation';

interface Order {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
  order_date: string;
}

interface ProductStats {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
}

export default function SellerDashboard() {
  console.log('SellerDashboard component rendered');
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('SellerDashboard useEffect triggered');
    console.log('User:', user);
    console.log('Token:', token);

    if (!user || !token) {
      console.log('No user or token, redirecting to login');
      router.push('/login');
      return;
    }

    if (user.role !== 'seller') {
      console.log('User is not a seller, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch recent orders
        const ordersResponse = await fetch('/api/seller/orders?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);

        // Fetch product statistics
        const statsResponse = await fetch('/api/seller/product-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch product statistics');
        }
        const statsData = await statsResponse.json();
        setProductStats(statsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.username}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="font-bold">Recent Orders</CardHeader>
          <Divider />
          <CardBody>
            {recentOrders.length > 0 ? (
              <Table aria-label="Recent orders">
                <TableHeader>
                  <TableColumn>Product</TableColumn>
                  <TableColumn>Quantity</TableColumn>
                  <TableColumn>Total</TableColumn>
                  <TableColumn>Date</TableColumn>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.product_name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.total_price.toFixed(2)}</TableCell>
                      <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No recent orders</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="font-bold">Product Statistics</CardHeader>
          <Divider />
          <CardBody>
            {productStats ? (
              <div className="space-y-2">
                <p>Total Products: {productStats.totalProducts}</p>
                <p>Total Stock: {productStats.totalStock}</p>
                <p>Total Value: ${productStats.totalValue?.toFixed(2) || '0.00'}</p>
              </div>
            ) : (
              <p>No products listed</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
