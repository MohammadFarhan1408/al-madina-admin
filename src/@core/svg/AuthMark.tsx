// React Imports
import type { SVGAttributes } from 'react'

/**
 * Art Deco diamond mark used on auth screens — a rotated square frame with a
 * crosshair and a small central bottle silhouette, echoing the mobile app's
 * splash screen mark. Uses `currentColor`.
 */
const AuthMark = (props: SVGAttributes<SVGElement>) => (
  <svg width='80' height='80' viewBox='0 0 80 80' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
    <rect x='40' y='8' width='45' height='45' transform='rotate(45 40 40)' stroke='currentColor' strokeWidth='1.5' />
    <line x1='8' y1='40' x2='72' y2='40' stroke='currentColor' strokeWidth='1' opacity='0.7' />
    <line x1='40' y1='8' x2='40' y2='72' stroke='currentColor' strokeWidth='1' opacity='0.7' />
    <rect x='36.5' y='29' width='7' height='22' rx='1.5' fill='currentColor' />
  </svg>
)

export default AuthMark
