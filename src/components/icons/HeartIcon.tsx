import type { IconProps } from './types'

/** Figma `Icon/Heart`, geometry exported from node set 207:1595. */
export function HeartIcon({ size = 24, ...props }: IconProps) {
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
      <path d="M20.8 4.60001C20.2889 4.08601 19.6812 3.67811 19.0119 3.39977C18.3426 3.12144 17.6249 2.97815 16.9 2.97815C16.1751 2.97815 15.4574 3.12144 14.7881 3.39977C14.1188 3.67811 13.5111 4.08601 13 4.60001L12 5.70001L11 4.60001C9.96565 3.56566 8.56278 2.98457 7.1 2.98457C5.63721 2.98457 4.23434 3.56566 3.2 4.60001C2.16565 5.63435 1.58456 7.03722 1.58456 8.50001C1.58456 9.96279 2.16565 11.3657 3.2 12.4L12 21.3L20.8 12.4C21.314 11.8889 21.7219 11.2812 22.0002 10.6119C22.2786 9.9426 22.4219 9.22488 22.4219 8.50001C22.4219 7.77513 22.2786 7.05741 22.0002 6.38811C21.7219 5.71881 21.314 5.11112 20.8 4.60001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}
