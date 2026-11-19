import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    let sessionToken = cookies().get('fz_admin_session')?.value;

    // Fallback: check Authorization Bearer header
    if (!sessionToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7).trim();
      }
    }

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
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

    return NextResponse.json({ authenticated: true, admin, token: sessionToken });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
