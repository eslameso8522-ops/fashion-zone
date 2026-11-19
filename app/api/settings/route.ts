import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'default',
          storeName: 'Fashion Zone',
          whatsappNumber: '201000000000',
          facebookUrl: 'https://facebook.com',
          instagramUrl: 'https://instagram.com',
          tiktokUrl: 'https://tiktok.com',
          announcementText: 'تألقي مع تشكيلة Fashion Zone الجديدة ✨ شحن مجاني للطلبات فوق 500 جنيه | كود خصم: GIRL10',
          announcementEnabled: true,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    // Return fallback defaults
    return NextResponse.json({
      success: true,
      settings: {
        storeName: 'Fashion Zone',
        whatsappNumber: '201000000000',
        facebookUrl: 'https://facebook.com',
        instagramUrl: 'https://instagram.com',
        tiktokUrl: 'https://tiktok.com',
        announcementText: 'تألقي مع تشكيلة Fashion Zone الجديدة ✨ شحن مجاني للطلبات فوق 500 جنيه | كود خصم: GIRL10',
        announcementEnabled: true,
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      storeName,
      whatsappNumber,
      facebookUrl,
      instagramUrl,
      tiktokUrl,
      announcementText,
      announcementEnabled,
    } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        storeName,
        whatsappNumber,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
        announcementText,
        announcementEnabled: Boolean(announcementEnabled),
      },
      create: {
        id: 'default',
        storeName: storeName || 'Fashion Zone',
        whatsappNumber: whatsappNumber || '201000000000',
        facebookUrl: facebookUrl || 'https://facebook.com',
        instagramUrl: instagramUrl || 'https://instagram.com',
        tiktokUrl: tiktokUrl || 'https://tiktok.com',
        announcementText: announcementText || 'تألقي مع تشكيلة Fashion Zone الجديدة ✨',
        announcementEnabled: Boolean(announcementEnabled),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حفظ إعدادات المتجر' },
      { status: 500 }
    );
  }
}
