/**
 * Account / saved / profile cover images exported from Figma MCP assets.
 * Filenames keep the `.png` suffix requested for downloads.
 */
import ticketCoverWinter from '@/assets/account/ticket-cover-winter.png'
import ticketCoverNada from '@/assets/account/ticket-cover-nada.png'
import ticketCoverSymphony from '@/assets/account/ticket-cover-symphony.png'
import recSoundstorm from '@/assets/account/rec-soundstorm.png'
import recDesertCinema from '@/assets/account/rec-desert-cinema.png'
import recLayaliOud from '@/assets/account/rec-layali-oud.png'
import saved1 from '@/assets/account/saved-1.png'
import saved2 from '@/assets/account/saved-2.png'
import saved3 from '@/assets/account/saved-3.png'
import saved4 from '@/assets/account/saved-4.png'
import saved5 from '@/assets/account/saved-5.png'
import saved6 from '@/assets/account/saved-6.png'
import saved7 from '@/assets/account/saved-7.png'
import saved8 from '@/assets/account/saved-8.png'
import profileTicket1 from '@/assets/account/profile-ticket-1.png'
import profileTicket2 from '@/assets/account/profile-ticket-2.png'
import profileTicket3 from '@/assets/account/profile-ticket-3.png'
import profileTicket4 from '@/assets/account/profile-ticket-4.png'

export const TICKET_COVERS = {
  'winter-nights': ticketCoverWinter,
  'nada-warehouse': ticketCoverNada,
  'symphony-sands': ticketCoverSymphony,
} as const

export const SIDEBAR_REC_COVERS = [recSoundstorm, recDesertCinema, recLayaliOud] as const

export const SAVED_COVERS = [saved1, saved2, saved3, saved4, saved5, saved6, saved7, saved8] as const

export const PROFILE_TICKET_COVERS = [
  profileTicket1,
  profileTicket2,
  profileTicket3,
  profileTicket4,
] as const
