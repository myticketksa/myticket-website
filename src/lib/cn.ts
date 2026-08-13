import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * The text styles in `styles/typography.css` are custom utilities named
 * `text-<role>-<variant>`, which collides head-on with Tailwind's own `text-<colour>`.
 * Out of the box `tailwind-merge` classifies them as colours and drops them:
 *
 *     twMerge('text-label-badge text-ink-brand-strong') → 'text-ink-brand-strong'
 *
 * That was silently deleting the type ramp everywhere a style and a colour met in one
 * `cn()` call — every `StatusBadge` tone, every field label, the section headers and the
 * footer among them — so the affected text fell back to whatever it inherited.
 *
 * Registering the roles as font-size classes fixes it. This matches on the **role
 * prefix** rather than a list of the twenty-two current style names, so a new style added
 * to `typography.css` is covered without touching this file. None of the colour tokens in
 * `theme.css` begins with one of these words, so there is no ambiguity in the other
 * direction.
 */
const TYPOGRAPHY_ROLES = ['display', 'heading', 'body', 'numeric', 'label'] as const

const isTypographyStyle = (value: string) =>
  TYPOGRAPHY_ROLES.some((role) => value === role || value.startsWith(`${role}-`))

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [isTypographyStyle] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
