import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fashion Zone 👕👖👗 | متجر ملابس الشتاء والهوم وير والأطفال',
    short_name: 'Fashion Zone',
    description: 'كوليكشن شتاء 2026/2027: بيجامات قطيفة وهايدي، ترينجات ميلتون خروج، ملابس أطفال وشبابي، وجواكت ووتر بروف',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfbf9',
    theme_color: '#f43f5e',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
