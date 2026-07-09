import type { MetadataRoute } from 'next';

/** PWA-ready web app manifest served at `/manifest.webmanifest`. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Money Audit — Smart Finance Tracker',
    short_name: 'Money Audit',
    description: 'Track expenses, split bills, manage budgets, and grow your savings with Money Audit.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1c1f26',
    theme_color: '#1c1f26',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
