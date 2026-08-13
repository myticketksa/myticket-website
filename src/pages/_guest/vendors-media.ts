/**
 * Committed Vendors photography from Figma `207:5992` / `207:6338`
 * (MCP Asset API, `.png` suffix).
 */
import dir1 from '@/assets/vendors/dir-1.png'
import dir2 from '@/assets/vendors/dir-2.png'
import dir3 from '@/assets/vendors/dir-3.png'
import dir4 from '@/assets/vendors/dir-4.png'
import dir5 from '@/assets/vendors/dir-5.png'
import dir6 from '@/assets/vendors/dir-6.png'
import dir7 from '@/assets/vendors/dir-7.png'
import dir8 from '@/assets/vendors/dir-8.png'
import dir9 from '@/assets/vendors/dir-9.png'
import detailCover from '@/assets/vendors/detail-cover.png'
import detailLogo from '@/assets/vendors/detail-logo.png'
import portfolio1 from '@/assets/vendors/portfolio-1.png'
import portfolio2 from '@/assets/vendors/portfolio-2.png'
import portfolio3 from '@/assets/vendors/portfolio-3.png'
import portfolio4 from '@/assets/vendors/portfolio-4.png'
import portfolio5 from '@/assets/vendors/portfolio-5.png'
import portfolio6 from '@/assets/vendors/portfolio-6.png'
import similar1 from '@/assets/vendors/similar-1.png'
import similar2 from '@/assets/vendors/similar-2.png'

export const VENDOR_DIRECTORY_IMAGES = [
  dir1,
  dir2,
  dir3,
  dir4,
  dir5,
  dir6,
  dir7,
  dir8,
  dir9,
] as const

/** Directory cards as drawn on Vendors `207:5992`. */
export const VENDOR_DIRECTORY = [
  {
    name: 'Najd Hospitality',
    services: 'Catering · VIP hosting',
    rating: '4.8',
    meta: 'Riyadh · Qassim · 302 reviews',
    price: 'SAR 9,000',
    verified: true,
    image: dir1,
  },
  {
    name: 'Lumen Studio',
    services: 'Photography · Film',
    rating: '4.9',
    meta: 'Riyadh · Jeddah · 188 reviews',
    price: 'SAR 4,500',
    verified: true,
    image: dir2,
  },
  {
    name: 'Sawt Audio Group',
    services: 'Sound · PA · Live mixing',
    rating: '4.8',
    meta: 'Central Region · 214 reviews',
    price: 'SAR 6,200',
    verified: true,
    image: dir3,
  },
  {
    name: 'Bayt Decor',
    services: 'Decor · Flowers',
    rating: '4.7',
    meta: 'Riyadh · 156 reviews',
    price: 'SAR 3,800',
    verified: true,
    image: dir4,
  },
  {
    name: 'Hala Events Planning',
    services: 'Planning · Coordination',
    rating: '4.9',
    meta: 'Kingdom-wide · 97 reviews',
    price: 'SAR 12,000',
    verified: true,
    image: dir5,
  },
  {
    name: 'Rally Crew Co.',
    services: 'Staff · Ushers',
    rating: '4.6',
    meta: 'Riyadh · 141 reviews',
    price: 'SAR 2,400',
    verified: true,
    image: dir6,
  },
  {
    name: 'Shield Event Security',
    services: 'Security · Crowd management',
    rating: '4.9',
    meta: 'Kingdom-wide · 268 reviews',
    price: 'SAR 5,500',
    verified: true,
    image: dir7,
  },
  {
    name: 'Mirage Visuals',
    services: 'Lighting · LED · Projection',
    rating: '4.8',
    meta: 'Riyadh · Jeddah · 173 reviews',
    price: 'SAR 8,100',
    verified: true,
    image: dir8,
  },
  {
    name: 'Tarab Transport',
    services: 'Logistics · Transport',
    rating: '4.5',
    meta: 'Kingdom-wide · 88 reviews',
    price: 'SAR 1,900',
    verified: true,
    image: dir9,
  },
] as const

export const VENDOR_DETAIL_MEDIA = {
  cover: detailCover,
  logo: detailLogo,
  portfolio: [
    {
      image: portfolio1,
      title: 'Soundstorm main stage',
      meta: 'Banban · 2025',
    },
    {
      image: portfolio2,
      title: 'Riyadh Season opening',
      meta: 'Boulevard · 2025',
    },
    {
      image: portfolio3,
      title: 'Ithra conference build',
      meta: 'Dhahran · 2025',
    },
    {
      image: portfolio4,
      title: 'Maraya gala staging',
      meta: 'AlUla · 2024',
    },
    {
      image: portfolio5,
      title: 'Jeddah Season waterfront',
      meta: 'Jeddah · 2024',
    },
    {
      image: portfolio6,
      title: 'Diriyah E-Prix fan zone',
      meta: 'Diriyah · 2024',
    },
  ],
  similar: [similar1, similar2, detailCover] as const,
} as const
