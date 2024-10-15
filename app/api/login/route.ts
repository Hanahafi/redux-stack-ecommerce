import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import * as jose from 'jose';
import { openDb } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const db = await openDb();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    const token = await new jose.SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secretKey);

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed', error: (error as Error).message }, { status: 500 });
  }
}
