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
    
    // Verify that the user is an admin
    const user = await db.get('SELECT role FROM users WHERE id = ?', [payload.userId]);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db.all(`
      SELECT 
        id, 
        buyer_id as buyerId, 
        product_id as productId, 
        quantity, 
        total_price as totalPrice, 
        order_date as orderDate, 
        status
      FROM orders
      ORDER BY order_date DESC
    `);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}
