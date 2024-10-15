import { NextResponse } from 'next/server';
import { openDb } from '../../../../../lib/db';
import * as jose from 'jose';

async function verifyToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not set in the environment variables');
  }

  const secretKey = new TextEncoder().encode(jwtSecret);
  const { payload } = await jose.jwtVerify(token, secretKey);

  return payload.userId as number | null;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, price, quantity } = await request.json();
    const db = await openDb();
    await db.run(
      'UPDATE products SET name = ?, price = ?, quantity = ? WHERE id = ? AND seller_id = ?',
      [name, price, quantity, params.id, userId]
    );
    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', params.id);
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ message: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await openDb();
    await db.run('DELETE FROM products WHERE id = ? AND seller_id = ?', [params.id, userId]);
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ message: 'Failed to delete product' }, { status: 500 });
  }
}
