import type { ReactNode } from 'react'

type FormLayoutProps = {

  /** The form's main sections, top to bottom. */
  children: ReactNode

  /** Narrow right column — status, organisation, a live preview. Stacks
   *  under the main column below `lg`. */
  aside?: ReactNode

  /** Keep the aside in view while the main column scrolls — only for an aside
   *  shorter than the viewport (a preview), or its bottom would be unreachable. */
  stickyAside?: boolean
}

/** The page grid every create/edit form shares, so section widths, gaps and
 *  the aside's position are identical across products, categories,
 *  collections and coupons. */
const FormLayout = ({ children, aside, stickyAside = false }: FormLayoutProps) => (
  <div className='grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] xl:gap-6'>
    <div className='flex min-w-0 flex-col gap-5 xl:gap-6'>{children}</div>
    {aside && (
      <div
        className={
          stickyAside
            ? 'flex min-w-0 flex-col gap-5 lg:sticky lg:top-[calc(var(--header-height)+16px)] xl:gap-6'
            : 'flex min-w-0 flex-col gap-5 xl:gap-6'
        }
      >
        {aside}
      </div>
    )}
  </div>
)

export default FormLayout
