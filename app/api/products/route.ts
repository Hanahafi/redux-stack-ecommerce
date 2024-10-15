import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';
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

    const db = await openDb();
    let products;

    if (payload.role === 'admin') {
      products = await db.all('SELECT * FROM products');
    } else if (payload.role === 'seller') {
      products = await db.all('SELECT * FROM products WHERE seller_id = ?', [payload.userId]);
    } else {
      products = await db.all('SELECT * FROM products');
    }
    
    if (!Array.isArray(products)) {
      throw new Error('Invalid data format');
    }
    
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, price, quantity, sellerId } = await request.json();
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO products (name, price, quantity, seller_id) VALUES (?, ?, ?, ?)',
      [name, price, quantity, sellerId]
    );
    const product = await db.get('SELECT * FROM products WHERE id = ?', result.lastID);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
  }
}
