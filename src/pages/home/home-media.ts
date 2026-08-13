/**
 * Committed Home photography from Figma `207:4362` (MCP Asset API, `.png` suffix).
 * Wired into card `image` / `avatar` props so the page matches the design in the browser.
 */
import heroFeatured1 from '@/assets/home/hero-featured-1.jpg'
import heroFeatured2 from '@/assets/home/hero-featured-2.jpg'
import talent1 from '@/assets/home/talent-1.jpg'
import talent2 from '@/assets/home/talent-2.jpg'
import talent3 from '@/assets/home/talent-3.jpg'
import talent4 from '@/assets/home/talent-4.jpg'
import talent5 from '@/assets/home/talent-5.jpg'
import event1 from '@/assets/home/event-1.jpg'
import event2 from '@/assets/home/event-2.jpg'
import event3 from '@/assets/home/event-3.jpg'
import event4 from '@/assets/home/event-4.jpg'
import event5 from '@/assets/home/event-5.jpg'
import event6 from '@/assets/home/event-6.jpg'
import event7 from '@/assets/home/event-7.jpg'
import event8 from '@/assets/home/event-8.jpg'
import featuredPanel1 from '@/assets/home/featured-panel-1.jpg'
import featuredPanel2 from '@/assets/home/featured-panel-2.jpg'
import featuredPanel3 from '@/assets/home/featured-panel-3.jpg'
import experience1 from '@/assets/home/experience-1.jpg'
import experience2 from '@/assets/home/experience-2.jpg'
import experience3 from '@/assets/home/experience-3.jpg'
import experience4 from '@/assets/home/experience-4.jpg'
import organizer1 from '@/assets/home/organizer-1.jpg'
import organizer2 from '@/assets/home/organizer-2.jpg'
import organizer3 from '@/assets/home/organizer-3.jpg'
import organizer4 from '@/assets/home/organizer-4.jpg'
import organizer5 from '@/assets/home/organizer-5.jpg'
import organizer6 from '@/assets/home/organizer-6.jpg'
import vendor1 from '@/assets/home/vendor-1.jpg'
import vendor2 from '@/assets/home/vendor-2.jpg'
import vendor3 from '@/assets/home/vendor-3.jpg'
import vendor5 from '@/assets/home/vendor-5.jpg'

export const HOME_HERO_IMAGES = [heroFeatured1, heroFeatured2] as const
export const HOME_TALENT_IMAGES = [talent1, talent2, talent3, talent4, talent5] as const
export const HOME_EVENT_IMAGES = [
  event1,
  event2,
  event3,
  event4,
  event5,
  event6,
  event7,
  event8,
] as const
export const HOME_FEATURED_PANEL_IMAGES = [
  featuredPanel1,
  featuredPanel2,
  featuredPanel3,
] as const
export const HOME_EXPERIENCE_IMAGES = [
  experience1,
  experience2,
  experience3,
  experience4,
] as const
export const HOME_ORGANIZER_AVATARS = [
  organizer1,
  organizer2,
  organizer3,
  organizer4,
  organizer5,
  organizer6,
] as const
/** Index 3 and 5 are ImagePlaceholder in Figma — leave undefined so the card draws the gradient. */
export const HOME_VENDOR_IMAGES = [
  vendor1,
  vendor2,
  vendor3,
  undefined,
  vendor5,
  undefined,
] as const
