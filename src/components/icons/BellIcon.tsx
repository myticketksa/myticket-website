import type { IconProps } from './types'

/** Figma `Icon/Bell`, geometry exported from node set 207:1595. */
export function BellIcon({ size = 24, ...props }: IconProps) {
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
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.7 21C13.5206 21.2894 13.2703 21.5283 12.9729 21.6939C12.6754 21.8595 12.3405 21.9464 12 21.9464C11.6595 21.9464 11.3247 21.8595 11.0272 21.6939C10.7297 21.5283 10.4794 21.2894 10.3 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
