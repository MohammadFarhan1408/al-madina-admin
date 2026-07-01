'use client'

// Third-party Imports
import classnames from 'classnames'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  return (
    <div
      className={classnames(horizontalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span className='text-textSecondary'>{`© ${new Date().getFullYear()} `}</span>
        <span className='text-primary font-medium'>Al Madina Ittar</span>
        <span className='text-textSecondary'>{` · Admin Panel`}</span>
      </p>
      <p className='text-textSecondary max-md:hidden'>Luxury Arabian Perfumery</p>
    </div>
  )
}

export default FooterContent
