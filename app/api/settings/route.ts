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
          promoPopupTitle: 'عرض خاص وحصري لكِ يا جميلة ✨',
          promoPopupText: 'خصم إضافي 10% بمناسبة إطلاق التشكيلة الجديدة! استخدمي كود الخصم الآن واستمتعي بشحن سريع لباب بيتك.',
          promoCouponCode: 'GIRL10',
          promoPopupEnabled: true,
          heroBannerTitle: 'تشكيلة الخريف والشتاء الفاخرة',
          heroBannerSubtitle: 'تألقي بأحدث فساتين السهرة والعبايات الراقية بتصميمات ساحرة',
          heroBannerBadge: 'خصومات حصرية لفترة محدودة 🔥',
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
        promoPopupTitle: 'عرض خاص وحصري لكِ يا جميلة ✨',
        promoPopupText: 'خصم إضافي 10% بمناسبة إطلاق التشكيلة الجديدة! استخدمي كود الخصم الآن واستمتعي بشحن سريع لباب بيتك.',
        promoCouponCode: 'GIRL10',
        promoPopupEnabled: true,
        heroBannerTitle: 'تشكيلة الخريف والشتاء الفاخرة',
        heroBannerSubtitle: 'تألقي بأحدث فساتين السهرة والعبايات الراقية بتصميمات ساحرة',
        heroBannerBadge: 'خصومات حصرية لفترة محدودة 🔥',
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
      promoPopupTitle,
      promoPopupText,
      promoPopupImage,
      promoCouponCode,
      promoPopupEnabled,
      heroBannerTitle,
      heroBannerSubtitle,
      heroBannerBadge,
    } = body;

    const dataPayload: any = {};
    if (storeName !== undefined) dataPayload.storeName = storeName;
    if (whatsappNumber !== undefined) dataPayload.whatsappNumber = whatsappNumber;
    if (facebookUrl !== undefined) dataPayload.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) dataPayload.instagramUrl = instagramUrl;
    if (tiktokUrl !== undefined) dataPayload.tiktokUrl = tiktokUrl;
    if (announcementText !== undefined) dataPayload.announcementText = announcementText;
    if (announcementEnabled !== undefined) dataPayload.announcementEnabled = Boolean(announcementEnabled);
    if (promoPopupTitle !== undefined) dataPayload.promoPopupTitle = promoPopupTitle;
    if (promoPopupText !== undefined) dataPayload.promoPopupText = promoPopupText;
    if (promoPopupImage !== undefined) dataPayload.promoPopupImage = promoPopupImage;
    if (promoCouponCode !== undefined) dataPayload.promoCouponCode = promoCouponCode;
    if (promoPopupEnabled !== undefined) dataPayload.promoPopupEnabled = Boolean(promoPopupEnabled);
    if (heroBannerTitle !== undefined) dataPayload.heroBannerTitle = heroBannerTitle;
    if (heroBannerSubtitle !== undefined) dataPayload.heroBannerSubtitle = heroBannerSubtitle;
    if (heroBannerBadge !== undefined) dataPayload.heroBannerBadge = heroBannerBadge;

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: dataPayload,
      create: {
        id: 'default',
        storeName: storeName || 'Fashion Zone',
        whatsappNumber: whatsappNumber || '201000000000',
        facebookUrl: facebookUrl || 'https://facebook.com',
        instagramUrl: instagramUrl || 'https://instagram.com',
        tiktokUrl: tiktokUrl || 'https://tiktok.com',
        announcementText: announcementText || 'تألقي مع تشكيلة Fashion Zone الجديدة ✨',
        announcementEnabled: announcementEnabled !== undefined ? Boolean(announcementEnabled) : true,
        promoPopupTitle: promoPopupTitle || 'عرض خاص وحصري لكِ يا جميلة ✨',
        promoPopupText: promoPopupText || '',
        promoPopupImage: promoPopupImage || null,
        promoCouponCode: promoCouponCode || 'GIRL10',
        promoPopupEnabled: promoPopupEnabled !== undefined ? Boolean(promoPopupEnabled) : true,
        heroBannerTitle: heroBannerTitle || 'تشكيلة الخريف والشتاء الفاخرة',
        heroBannerSubtitle: heroBannerSubtitle || 'تألقي بأحدث فساتين السهرة والعبايات الراقية بتصميمات ساحرة',
        heroBannerBadge: heroBannerBadge || 'خصومات حصرية لفترة محدودة 🔥',
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
