'use client'

import { useRouter } from 'next/navigation'

import Dropdown from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { getErrorMessage } from '@/libs/api/types'

const UserDropdown = () => {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { error } = useToast()

  const displayName = user?.fullName || 'Al Madina Admin'
  const displayEmail = user?.email || ''
  const avatarSrc = user?.avatar || '/images/avatars/1.png'

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
      trigger={
        <button type='button' className='relative rounded-full'>
          <img src={avatarSrc} alt={displayName} className='size-[38px] rounded-full object-cover' />
          <span className='absolute bottom-0 right-0 size-2 rounded-full bg-success ring-2 ring-backgroundPaper' />
        </button>
      }
    >
      <div className='flex items-center gap-2 px-4 py-3'>
        <img src={avatarSrc} alt={displayName} className='size-9 rounded-full object-cover' />
        <div className='flex flex-col items-start'>
          <span className='text-sm font-medium text-textPrimary'>{displayName}</span>
          <span className='text-xs text-textSecondary'>{displayEmail}</span>
        </div>
      </div>
      <div className='border-t border-secondary/20 px-3 py-2'>
        <Button fullWidth color='error' size='sm' endIcon={<i className='tabler-logout' />} onClick={handleUserLogout}>
          Logout
        </Button>
      </div>
    </Dropdown>
  )
}

export default UserDropdown
