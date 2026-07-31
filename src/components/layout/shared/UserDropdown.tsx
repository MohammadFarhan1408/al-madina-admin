'use client'

import { useRouter } from 'next/navigation'

import Badge from '@/components/ui/Badge'
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'
import { getInitials } from '@/utils/getInitials'

const UserDropdown = () => {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { error } = useToast()

  const displayName = user?.fullName || 'Al Madina Admin'
  const displayEmail = user?.email || ''
  const displayRole = user?.role
  const avatarSrc = user?.avatar

  const handleUserLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      error(getErrorMessage(err, 'Sign out failed'))
      router.push('/login')
    }
  }

  return (
    <Dropdown
      align='end'
      itemLabels={['Notifications', 'Sign out']}
      className='w-64'
      trigger={
        <button
          type='button'
          aria-label={`Account menu for ${displayName}`}
          className='flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primaryInk size-10 ring-2 ring-primary/30'
        >
          <Avatar src={avatarSrc} name={displayName} className='size-8' />
        </button>
      }
    >
      {/* Identity block, not a menu item — it isn't actionable, so it must not
          be reachable by the menu's arrow-key navigation. */}
      <div className='flex items-center gap-3 px-3 py-3.5'>
        <Avatar
          src={avatarSrc}
          name={displayName}
          className='size-10 ring-2 ring-primary/30 ring-offset-2 ring-offset-backgroundPaper'
        />
        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <span className='truncate text-[15px] font-semibold leading-5 text-textPrimary'>{displayName}</span>
          {displayEmail && <span className='truncate text-xs leading-4 text-textMuted'>{displayEmail}</span>}
        </div>
        {displayRole && (
          <Badge size='sm' color='primary' variant='filled' className='capitalize'>
            {displayRole}
          </Badge>
        )}
      </div>

      {/* Dividers are pulled out to the panel edge past the surface's own 1px
          inset, so they read as section rules rather than short floating lines. */}
      <div className='-mx-1 border-t border-border' />
      <DropdownItem className='mt-1' icon={<i className='tabler-bell' />} onClick={() => router.push('/notifications')}>
        Notifications
      </DropdownItem>
      <div className='-mx-1 mt-1 border-t border-border' />
      <div className='p-2'>
        <DropdownItem
          danger
          className='mt-1 border border-error'
          icon={<i className='tabler-logout' />}
          onClick={handleUserLogout}
        >
          Sign out
        </DropdownItem>
      </div>
    </Dropdown>
  )
}

/** Avatar with an initials fallback, so a missing or broken image degrades to
 *  the user's initials rather than a torn-image icon or a stock placeholder. */
const Avatar = ({ src, name, className }: { src?: string; name: string; className?: string }) =>
  src ? (
    <img src={src} alt='' className={`shrink-0 rounded-full border border-border object-cover ${className ?? ''}`} />
  ) : (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/18 text-xs font-semibold text-primaryInk ${className ?? ''}`}
    >
      {getInitials(name).slice(0, 2)}
    </span>
  )

export default UserDropdown
