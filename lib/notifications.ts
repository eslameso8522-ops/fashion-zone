import * as webpush from 'web-push';
import { prisma } from '@/lib/prisma';

const vapidPublicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BDEiu34VBWae4TyvwObzSB1jRPp-UvcQFi5TwXX1Yt7JA5lOnXgpjvHyFkS2bXdj-h-fTipwue25h6Epzt7eN0c';

const vapidPrivateKey =
  process.env.VAPID_PRIVATE_KEY || 'Vp8JJ9ayxS5MJhK2UG9Kzi70BZO9RuTM4xUMU1MTXhM';

const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@fashionzone.com';

// Configure Web Push with VAPID details
try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  console.warn('WebPush VAPID initialization warning:', e);
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url: string;
    [key: string]: any;
  };
}

/**
 * Send push notification to subscribers by role (CUSTOMER, ADMIN, or ALL)
 */
export async function sendPushNotificationToAll(
  payload: NotificationPayload,
  role?: 'CUSTOMER' | 'ADMIN' | 'ALL'
) {
  try {
    const whereClause: any = {};
    if (role && role !== 'ALL') {
      whereClause.role = role;
    }

    const subscribers = await prisma.pushSubscriber.findMany({
      where: whereClause,
    });

    if (subscribers.length === 0) {
      return { success: true, count: 0, message: 'لا يوجد مشتركون مسجلون حالياً' };
    }

    const jsonPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      data: payload.data || { url: '/' },
    });

    const failedIds: string[] = [];

    const sendPromises = subscribers.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, jsonPayload);
      } catch (err: any) {
        // If expired or gone (410, 404), mark for removal
        if (err.statusCode === 410 || err.statusCode === 404) {
          failedIds.push(sub.id);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    // Clean up inactive/expired subscribers
    if (failedIds.length > 0) {
      await prisma.pushSubscriber.deleteMany({
        where: { id: { in: failedIds } },
      }).catch(() => {});
    }

    return {
      success: true,
      sentCount: subscribers.length - failedIds.length,
      cleanedCount: failedIds.length,
    };
  } catch (error: any) {
    console.error('Error broadcasting push notification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger instant notification when a customer places an order
 */
export async function notifyAdminOnNewOrder(order: {
  orderNumber: string;
  customerName: string;
  total: number;
}) {
  return sendPushNotificationToAll(
    {
      title: 'طلب شراء جديد وارد! 🛍️✨',
      body: `العميلة ${order.customerName} قامت بطلب جديد بقيمة ${order.total} ج.م [كود: #${order.orderNumber}]`,
      icon: '/icon-192.png',
      data: { url: '/admin' },
    },
    'ADMIN'
  );
}

/**
 * Trigger instant notification to customers when a new product arrives
 */
export async function notifyCustomersOnNewProduct(product: {
  name: string;
  price: number;
  slug: string;
  image?: string;
}) {
  return sendPushNotificationToAll(
    {
      title: 'موديل جديد وصل حصرياً في Fashion Zone ✨👗',
      body: `تألقي الآن مع "${product.name}" بسعر ${product.price} ج.م مع معاينة قبل الاستلام وشحن سريع لباب بيتكِ!`,
      icon: product.image || '/icon-192.png',
      data: { url: `/product/${product.slug}` },
    },
    'CUSTOMER'
  );
}
