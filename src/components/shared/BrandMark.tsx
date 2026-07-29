// React Imports
import type { SVGAttributes } from 'react'

/**
 * Al Madina brand mark — a Moorish pointed-arch (mihrab) frame enclosing an
 * ittar droplet. Uses `currentColor` so it inherits the theme's gold primary.
 */
const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      {/* Arch frame (outer boundary minus inner opening) */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M16 3C23 3 27 8.5 27 15.5V29H5V15.5C5 8.5 9 3 16 3ZM16 7C11 7 8.5 11 8.5 15.5V25.5H23.5V15.5C23.5 11 21 7 16 7Z'
        fill='currentColor'
      />
      {/* Ittar droplet */}
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M16 11.5C18.6 14.7 20 16.9 20 19C20 21.2 18.2 23 16 23C13.8 23 12 21.2 12 19C12 16.9 13.4 14.7 16 11.5Z'
        fill='currentColor'
      />
    </svg>
  )
}

export default Logo
