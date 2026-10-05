'use client'

import { forwardRef } from 'react'

import Input, { type InputProps } from './Input'

export type NumberInputProps = Omit<InputProps, 'type' | 'value' | 'onChange'> & {
  value: number | undefined
  onChange: (value: number | undefined) => void
}

/** Number field that can actually be emptied. The old per-form
 *  `onChange={e => … === '' ? 0 : Number(…)}` snapped a cleared field back to 0,
 *  so you could never type a fresh value over the old one. Empty is `undefined`
 *  here; the Zod schema decides whether that is allowed. Plugs straight into
 *  RHF: `<NumberInput {...field} />`. */
const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(({ value, onChange, ...props }, ref) => (
  <Input
    {...props}
    ref={ref}
    type='number'
    inputMode='decimal'
    value={value ?? ''}
    onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
  />
))

NumberInput.displayName = 'NumberInput'

export default NumberInput
