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
          heroTitle: 'كوني الأجمل في كل إطلالة مع Fashion Zone',
          heroSubtitle: 'اكتشفي تشكيلة راقية ومختارة بعناية من فساتين السهرة الناعمة، العبايات المطرزة، الحقائب والمجوهرات التي تزيدكِ تألقاً وسحراً.',
          heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
          heroBadgeText: 'أعلى تقييم ⭐ 4.9',
          heroBadgeSubtext: 'أزياء صيف 2026',
          heroCouponTitle: 'كود الخصم الفوري',
          heroCouponCode: 'GIRL10',
          heroCouponDiscount: 'خصم 10%',
          heroCtaText: 'تسوقي الآن / Shop Now',
          heroCtaLink: '#catalog',
          heroBannerTitle: 'خصم يصل إلى 35% على تشكيلة فساتين السهرة الفاخرة!',
          heroBannerSubtitle: 'استمتعي بأفضل الأسعار مع خامات مستوردة أصلية 100% وشحن مجاني حتى باب منزلك مع إمكانية المعاينة.',
          heroBannerBadge: 'عرض محدود لفترة وجيزة',
          heroBannerCtaText: 'تصفحي العروض الآن',
          heroBannerCtaLink: '#catalog',
          heroBannerImage: '',
          heroBannerEnabled: true,
        },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
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
        heroTitle: 'كوني الأجمل في كل إطلالة مع Fashion Zone',
        heroSubtitle: 'اكتشفي تشكيلة راقية ومختارة بعناية من فساتين السهرة الناعمة، العبايات المطرزة، الحقائب والمجوهرات التي تزيدكِ تألقاً وسحراً.',
        heroImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        heroBadgeText: 'أعلى تقييم ⭐ 4.9',
        heroBadgeSubtext: 'أزياء صيف 2026',
        heroCouponTitle: 'كود الخصم الفوري',
        heroCouponCode: 'GIRL10',
        heroCouponDiscount: 'خصم 10%',
        heroCtaText: 'تسوقي الآن / Shop Now',
        heroCtaLink: '#catalog',
        heroBannerTitle: 'خصم يصل إلى 35% على تشكيلة فساتين السهرة الفاخرة!',
        heroBannerSubtitle: 'استمتعي بأفضل الأسعار مع خامات مستوردة أصلية 100% وشحن مجاني حتى باب منزلك مع إمكانية المعاينة.',
        heroBannerBadge: 'عرض محدود لفترة وجيزة',
        heroBannerCtaText: 'تصفحي العروض الآن',
        heroBannerCtaLink: '#catalog',
        heroBannerImage: '',
        heroBannerEnabled: true,
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
      heroBannerCtaText,
      heroBannerCtaLink,
      heroBannerImage,
      heroBannerEnabled,
      heroTitle,
      heroSubtitle,
      heroImage,
      heroBadgeText,
      heroBadgeSubtext,
      heroCouponTitle,
      heroCouponCode,
      heroCouponDiscount,
      heroCtaText,
      heroCtaLink,
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
    if (heroBannerCtaText !== undefined) dataPayload.heroBannerCtaText = heroBannerCtaText;
    if (heroBannerCtaLink !== undefined) dataPayload.heroBannerCtaLink = heroBannerCtaLink;
    if (heroBannerImage !== undefined) dataPayload.heroBannerImage = heroBannerImage;
    if (heroBannerEnabled !== undefined) dataPayload.heroBannerEnabled = Boolean(heroBannerEnabled);

    if (heroTitle !== undefined) dataPayload.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) dataPayload.heroSubtitle = heroSubtitle;
    if (heroImage !== undefined) dataPayload.heroImage = heroImage;
    if (heroBadgeText !== undefined) dataPayload.heroBadgeText = heroBadgeText;
    if (heroBadgeSubtext !== undefined) dataPayload.heroBadgeSubtext = heroBadgeSubtext;
    if (heroCouponTitle !== undefined) dataPayload.heroCouponTitle = heroCouponTitle;
    if (heroCouponCode !== undefined) dataPayload.heroCouponCode = heroCouponCode;
    if (heroCouponDiscount !== undefined) dataPayload.heroCouponDiscount = heroCouponDiscount;
    if (heroCtaText !== undefined) dataPayload.heroCtaText = heroCtaText;
    if (heroCtaLink !== undefined) dataPayload.heroCtaLink = heroCtaLink;

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
        heroTitle: heroTitle || 'كوني الأجمل في كل إطلالة مع Fashion Zone',
        heroSubtitle: heroSubtitle || 'اكتشفي تشكيلة راقية ومختارة بعناية...',
        heroImage: heroImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        heroBadgeText: heroBadgeText || 'أعلى تقييم ⭐ 4.9',
        heroBadgeSubtext: heroBadgeSubtext || 'أزياء صيف 2026',
        heroCouponTitle: heroCouponTitle || 'كود الخصم الفوري',
        heroCouponCode: heroCouponCode || 'GIRL10',
        heroCouponDiscount: heroCouponDiscount || 'خصم 10%',
        heroCtaText: heroCtaText || 'تسوقي الآن / Shop Now',
        heroCtaLink: heroCtaLink || '#catalog',
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
