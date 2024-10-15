import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';
import * as jose from 'jose';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secretKey);

    if (!payload.userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const db = await openDb();
    
    // First, check if the user is a seller
    const user = await db.get('SELECT role FROM users WHERE id = ?', [payload.userId]);
    if (!user || user.role !== 'seller') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const stats = await db.get(`
      SELECT 
        COUNT(*) as totalProducts,
        SUM(quantity) as totalStock,
        SUM(price * quantity) as totalValue
      FROM products
      WHERE seller_id = ?
    `, [payload.userId]);

    return NextResponse.json({
      totalProducts: stats.totalProducts,
      totalStock: stats.totalStock,
      totalValue: stats.totalValue
    }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product statistics:', error);
    return NextResponse.json({ message: 'Failed to fetch product statistics' }, { status: 500 });
  }
}
