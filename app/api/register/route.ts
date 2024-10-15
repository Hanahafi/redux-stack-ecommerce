import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import * as jose from 'jose';
import { openDb } from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json();
    console.log('Received registration request:', { username, email, role });

    const hashedPassword = await hash(password, 10);

    const db = await openDb();

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      console.log('Registration failed: Email already in use');
      return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
    }

    const result = await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    const user = await db.get('SELECT id, username, email, role FROM users WHERE id = ?', result.lastID);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set in the environment variables');
    }

    const secretKey = new TextEncoder().encode(jwtSecret);
    const token = await new jose.SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secretKey);

    console.log('User registered:', user);
    console.log('Token generated:', token);

    return NextResponse.json({ user, token }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Registration failed', error: (error as Error).message }, { status: 500 });
  }
}
