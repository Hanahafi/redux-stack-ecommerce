import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

export async function GET() {
  try {
    const cachedStats = cache.get('admin_statistics');
    if (cachedStats) {
      return NextResponse.json(cachedStats, { status: 200 });
    }

    const db = await openDb();
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const totalProducts = await db.get('SELECT COUNT(*) as count FROM products');
    const totalOrders = await db.get('SELECT COUNT(*) as count FROM orders');

    const statistics = {
      totalUsers: totalUsers.count,
      totalProducts: totalProducts.count,
      totalOrders: totalOrders.count
    };

    cache.set('admin_statistics', statistics);
    return NextResponse.json(statistics, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    return NextResponse.json({ message: 'Failed to fetch statistics' }, { status: 500 });
  }
}
