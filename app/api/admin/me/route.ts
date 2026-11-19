import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessionCookie = cookies().get('fz_admin_session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const [adminId, email] = decoded.split(':');

    if (!adminId || !email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });

    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, admin });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
