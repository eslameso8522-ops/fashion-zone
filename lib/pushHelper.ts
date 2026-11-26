/**
 * Convert VAPID public key string to Uint8Array for pushManager.subscribe
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BDEiu34VBWae4TyvwObzSB1jRPp-UvcQFi5TwXX1Yt7JA5lOnXgpjvHyFkS2bXdj-h-fTipwue25h6Epzt7eN0c';

/**
 * Register push subscription to backend
 */
export async function registerPushSubscription(role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER'): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as any,
      });
    }

    if (sub) {
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub,
          role,
        }),
      });
      const data = await res.json();
      return !!data.success;
    }
    return false;
  } catch (error) {
    console.warn('Could not register push subscription:', error);
    return false;
  }
}
