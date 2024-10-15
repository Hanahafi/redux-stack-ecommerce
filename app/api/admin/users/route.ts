import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';
import { hash } from 'bcrypt';

export async function GET() {
  try {
    const db = await openDb();
    const users = await db.all('SELECT id, username, email, role FROM users');
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json();
    const hashedPassword = await hash(password, 10);

    const db = await openDb();
    const result = await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    const newUser = await db.get('SELECT id, username, email, role FROM users WHERE id = ?', result.lastID);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ message: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const db = await openDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', userId);

    if (result.changes === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json({ message: 'Failed to delete user' }, { status: 500 });
  }
}
