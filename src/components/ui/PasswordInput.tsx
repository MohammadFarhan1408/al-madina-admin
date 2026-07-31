'use client'

import { forwardRef, useState } from 'react'

import IconButton from './IconButton'
import Input, { type InputProps } from './Input'

export type PasswordInputProps = Omit<InputProps, 'type' | 'endAdornment'>

/** Password field with an integrated reveal toggle. Extracted from the login
 *  and reset-password screens, which each carried their own copy of the
 *  toggle state and button markup.
 *
 *  The toggle is a transparent ghost button inside the field — no plate, no
 *  divider, no background of its own — so the control reads as one input
 *  rather than an input with something bolted to the end. `onMouseDown`
 *  preventDefault keeps the caret in the field when it's clicked. */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ tone = 'light', ...props }, ref) => {
  const [shown, setShown] = useState(false)

  return (
    <Input
      ref={ref}
      tone={tone}
      type={shown ? 'text' : 'password'}
      className='tracking-[0.02em]'
      endAdornment={
        <IconButton
          size='sm'
          color={tone === 'dark' ? 'inverse' : 'default'}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          onMouseDown={e => e.preventDefault()}
          onClick={() => setShown(s => !s)}
        >
          <i className={shown ? 'tabler-eye-off' : 'tabler-eye'} />
        </IconButton>
      }
      {...props}
    />
  )
})

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
