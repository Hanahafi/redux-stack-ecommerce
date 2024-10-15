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
    
    const orders = await db.all(`
      SELECT o.*, p.name as product_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.buyer_id = ?
      ORDER BY o.order_date DESC
    `, [payload.userId]);

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const { items, totalPrice, address } = await request.json();

    const db = await openDb();

    await db.run('BEGIN TRANSACTION');

    try {
      const orderDate = new Date().toISOString();

      for (const item of items) {
        const product = await db.get('SELECT quantity FROM products WHERE id = ?', item.id);
        if (!product || product.quantity < item.cartQuantity) {
          throw new Error(`Not enough stock for product ${item.name}`);
        }

        await db.run(
          'UPDATE products SET quantity = quantity - ? WHERE id = ?',
          [item.cartQuantity, item.id]
        );

        await db.run(
          'INSERT INTO orders (buyer_id, product_id, quantity, total_price, order_date, status, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [payload.userId, item.id, item.cartQuantity, item.price * item.cartQuantity, orderDate, 'Pending', address]
        );
      }

      await db.run('COMMIT');

      return NextResponse.json({ message: 'Order created successfully' }, { status: 201 });
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'Failed to create order', error: (error as Error).message }, { status: 500 });
  }
}
