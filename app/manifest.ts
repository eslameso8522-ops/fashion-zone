import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fashion Zone | متجر الأزياء النسائية والجمال',
    short_name: 'Fashion Zone',
    description: 'أرقى فساتين السهرة والعبايات والحقائب والمجوهرات النسائية',
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
