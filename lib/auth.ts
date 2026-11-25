import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export interface AdminUserSession {
  id: string;
  email: string;
  name: string | null;
}

export async function verifyAdmin(request?: Request): Promise<{
  authorized: boolean;
  admin?: AdminUserSession | null;
  errorResponse?: NextResponse;
}> {
  try {
    let sessionToken = cookies().get('fz_admin_session')?.value;

    if (!sessionToken && request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7).trim();
      }
    }

    if (!sessionToken) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'غير مصرح لك بالوصول (يرجى تسجيل الدخول كمسؤول أولاً)' },
          { status: 401 }
        ),
      };
    }

    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    const [adminId, email] = decoded.split(':');

    if (!adminId || !email) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'جلسة الدخول غير صالحة' },
          { status: 401 }
        ),
      };
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, name: true },
    });

    if (!admin || admin.email.toLowerCase() !== email.toLowerCase()) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'المسؤول غير موجود أو تم إلغاء صلاحياته' },
          { status: 401 }
        ),
      };
    }

    return { authorized: true, admin };
  } catch (error) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'فشل التحقق من صلاحيات الدخول' },
        { status: 401 }
      ),
    };
  }
}
