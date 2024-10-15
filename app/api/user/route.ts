import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { openDb } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    console.log('API /user - Received token:', token);

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secretKey);

    console.log('API /user - Decoded payload:', payload);

    const db = await openDb();
    const user = await db.get('SELECT id, username, email, role FROM users WHERE id = ?', [payload.userId]);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('API /user - User found:', user);

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('API /user - Error fetching user:', error);
    return NextResponse.json({ message: 'Failed to fetch user' }, { status: 500 });
  }
}
