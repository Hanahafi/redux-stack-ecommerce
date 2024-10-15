import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const products = await db.all('SELECT * FROM products');
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}
