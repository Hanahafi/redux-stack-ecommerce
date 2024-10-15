import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';
import * as jose from 'jose';

async function verifyToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Received token:', token);

  if (!token) {
    console.log('No token provided');
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not set in the environment variables');
    throw new Error('JWT_SECRET is not set in the environment variables');
  }

  try {
    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secretKey);
    console.log('Token verified, payload:', payload);
    return payload.userId as number | null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await openDb();
    const products = await db.all('SELECT * FROM products WHERE seller_id = ?', [userId]);
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, price, quantity } = await request.json();
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO products (name, price, quantity, seller_id) VALUES (?, ?, ?, ?)',
      [name, price, quantity, userId]
    );
    const product = await db.get('SELECT * FROM products WHERE id = ?', result.lastID);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}
