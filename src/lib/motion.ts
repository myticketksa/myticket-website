/**
 * Guest-site motion tokens — derived from the MyTicket motion language.
 * Prefer CSS transitions for color/border/hover; use `motion/react` for
 * viewport entrances, overlays, and stagger only.
 */

export const easeMicro = [0.25, 0.1, 0.25, 1] as const
export const easeStandard = [0.25, 0.1, 0.25, 1] as const
export const easeEnter = [0.16, 1, 0.3, 1] as const
export const easeExit = [0.4, 0, 1, 1] as const

export const motionTokens = {
  micro: { duration: 0.15, ease: easeMicro },
  standard: { duration: 0.2, ease: easeStandard },
  entrance: { duration: 0.45, ease: easeEnter },
  exit: { duration: 0.2, ease: easeExit },
  overlay: { duration: 0.3, ease: easeEnter },
  toastEnter: { duration: 0.35, ease: easeEnter },
  toastExit: { duration: 0.2, ease: easeExit },
  page: { duration: 0.2, ease: easeStandard },
} as const

/** Max cards that stagger into view; the rest appear instantly. */
export const STAGGER_MAX = 6
export const STAGGER_DELAY = 0.06
export const STAGGER_DELAY_MOBILE = 0.04

export const ENTRANCE_Y = 16
export const ENTRANCE_Y_CARD = 20
export const ENTRANCE_Y_MOBILE = 12
