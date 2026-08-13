import type { SVGProps } from 'react'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  /**
   * Rendered square size in px. The Figma set is drawn on a 24 grid
   * (`--size-icon-lg`); instances in the design also appear at 16
   * (`--size-icon-sm`), 15, 14 and 13.
   */
  size?: number
}
