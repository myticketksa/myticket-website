import type { IconProps } from './types'

/** Figma `Icon/Verified`, geometry exported from node set 207:1595. */
export function VerifiedIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 1.5L15 4.6L19.3 4.2L19.7 8.5L22.8 11.5L19.7 14.5L20.1 18.8L15.8 19.2L12.8 22.3L9.79999 19.2L5.49999 18.8L5.89999 14.5L2.79999 11.5L5.89999 8.5L5.49999 4.2L9.79999 4.6L12 1.5Z" fill="var(--color-brand-primary)" />
      <path d="M10.6 14.5L8.60002 12.5L7.40002 13.6L10.6 16.8L16.1 11.3L15 10.1L10.6 14.5Z" fill="var(--color-surface-default)" />
    </svg>
  )
}
