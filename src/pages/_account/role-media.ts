/**
 * Optional role-landing hero photography.
 *
 * Figma `207:12388` / `12611` / `12768` draw the hero slot as ImagePlaceholder
 * with a caption. Pass these into `RoleLandingHero` via `imagerySrc` only when
 * product opts into real photos; default pages leave the prop unset.
 */
import vendorHero from '@/assets/home/cta-band.jpg'
import organizerHero from '@/assets/organizers/detail-cover.jpg'
import talentHero from '@/assets/talents/detail-hero.jpg'

export const ROLE_VENDOR_HERO = vendorHero
export const ROLE_ORGANIZER_HERO = organizerHero
export const ROLE_TALENT_HERO = talentHero
