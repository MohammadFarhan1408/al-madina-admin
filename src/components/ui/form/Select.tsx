'use client'

import { forwardRef, useId, useRef, useState } from 'react'
import type { ButtonHTMLAttributes, ChangeEvent, FocusEvent, ReactNode } from 'react'

import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole
} from '@floating-ui/react'
import classnames from 'classnames'

import Field, { controlBase, controlState, controlTone, type FieldTone } from './Field'
import type { InputSize } from './Input'
import { PopoverMessage, PopoverOption, popoverSurface } from '../Popover'

export type SelectOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export type SelectProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'children'> & {
  label?: ReactNode
  error?: string
  helperText?: ReactNode
  options: SelectOption[]
  value?: string | number
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: FocusEvent<HTMLSelectElement>) => void
  placeholder?: string
  inputSize?: InputSize
  tone?: FieldTone
  containerClassName?: string
  required?: boolean

  /** Leading icon — for a filter pill (Category, Stock) where the icon carries
   *  the field's identity instead of a label sitting above it. */
  icon?: ReactNode
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-9 pl-2.5 pr-8',
  md: 'h-10 pl-3 pr-9',
  lg: 'h-11 pl-3.5 pr-10'
}

const iconSizeClasses: Record<InputSize, string> = {
  sm: 'h-9 pl-8 pr-8',
  md: 'h-10 pl-9 pr-9',
  lg: 'h-11 pl-10 pr-10'
}

const leadingIconPosition: Record<InputSize, string> = {
  sm: 'left-2.5',
  md: 'left-3',
  lg: 'left-3.5'
}

/** Styled dropdown with an anchored, keyboard-navigable listbox — replaces the
 *  native `<select>`, whose option list is drawn by the OS and can't be
 *  themed at all (mismatched font, no radius, no hover states).
 *
 *  Keeps the `value`/`onChange` contract of a native select (`e.target.value`
 *  via a synthesized event), so every existing caller works unchanged. */
const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      value = '',
      onChange,
      onBlur,
      placeholder,
      containerClassName,
      className,
      id,
      inputSize = 'md',
      tone = 'light',
      required,
      disabled,
      name,
      icon,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const listRef = useRef<(HTMLElement | null)[]>([])
    const reactId = useId()
    const selectId = id ?? name ?? reactId
    const listId = `${selectId}-listbox`
    const t = controlTone[tone]

    const { refs, floatingStyles, context, isPositioned } = useFloating({
      open,
      onOpenChange: setOpen,
      placement: 'bottom-start',
      whileElementsMounted: autoUpdate,
      middleware: [
        offset(6),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          apply({ rects, availableHeight, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
              maxHeight: `${Math.min(availableHeight - 8, 320)}px`
            })
          }
        })
      ]
    })

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
      useClick(context),
      useDismiss(context),
      useRole(context, { role: 'listbox' }),
      useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true
      })
    ])

    const selectedOption = options.find(o => String(o.value) === String(value))

    const select = (option: SelectOption) => {
      if (option.disabled) return
      onChange?.({ target: { value: String(option.value) } } as ChangeEvent<HTMLSelectElement>)
      setActiveIndex(null)
      setOpen(false)
    }

    return (
      <Field
        label={label}
        required={required}
        error={error}
        helperText={helperText}
        tone={tone}
        htmlFor={selectId}
        asLabel
        className={containerClassName}
      >
        <div className='relative flex w-full min-w-0'>
          <button
            ref={node => {
              refs.setReference(node)
              if (typeof ref === 'function') ref(node)
              else if (ref) ref.current = node
            }}
            type='button'
            id={selectId}
            disabled={disabled}
            aria-describedby={error || helperText ? `${selectId}-message` : undefined}
            aria-controls={open ? listId : undefined}
            {...getReferenceProps({ onBlur: onBlur as unknown as (e: FocusEvent<HTMLButtonElement>) => void })}
            {...rest}
            className={classnames(
              controlBase,
              'w-full min-w-0',
              icon ? iconSizeClasses[inputSize] : sizeClasses[inputSize],
              t.idle,
              t.text,
              controlState(Boolean(error), false),
              'cursor-pointer truncate text-left disabled:cursor-not-allowed disabled:opacity-60',
              !selectedOption && 'text-textMuted',
              className
            )}
          >
            {selectedOption ? selectedOption.label : (placeholder ?? '')}
          </button>
          {icon && (
            <span
              aria-hidden
              className={classnames(
                'pointer-events-none absolute top-[55%] -translate-y-1/2 text-[16px]',
                leadingIconPosition[inputSize],
                tone === 'dark' ? 'text-stone' : 'text-textMuted'
              )}
            >
              {icon}
            </span>
          )}
          <i
            aria-hidden
            className={classnames(
              'tabler-chevron-down pointer-events-none absolute top-1/2 -translate-y-1/2 text-[16px]',
              inputSize === 'sm' ? 'right-2' : 'right-3',
              tone === 'dark' ? 'text-stone' : 'text-textMuted'
            )}
          />
        </div>
        {open && (
          <div
            {...getFloatingProps({
              ref: refs.setFloating,
              id: listId,
              style: { ...floatingStyles, opacity: isPositioned ? 1 : 0 },
              className: popoverSurface
            })}
          >
            {placeholder && (
              <PopoverOption
                {...getItemProps({
                  ref(node: HTMLButtonElement | null) {
                    listRef.current[0] = node
                  },
                  onClick: () => select({ label: placeholder, value: '' })
                })}
                role='option'
                showCheck
                selected={!selectedOption}
                active={activeIndex === 0}
                tabIndex={-1}
              >
                {placeholder}
              </PopoverOption>
            )}
            {options.length === 0 ? (
              <PopoverMessage>No options</PopoverMessage>
            ) : (
              options.map((option, index) => {
                const itemIndex = placeholder ? index + 1 : index

                return (
                  <PopoverOption
                    key={option.value}
                    {...getItemProps({
                      ref(node: HTMLButtonElement | null) {
                        listRef.current[itemIndex] = node
                      },
                      onClick: () => select(option)
                    })}
                    role='option'
                    disabled={option.disabled}
                    showCheck
                    selected={selectedOption?.value === option.value}
                    active={activeIndex === itemIndex}
                    tabIndex={-1}
                  >
                    {option.label}
                  </PopoverOption>
                )
              })
            )}
          </div>
        )}
      </Field>
    )
  }
)

Select.displayName = 'Select'

export default Select
