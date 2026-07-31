'use client'

// Row-level "⋮" action menu used by the list views — replaces @core's
// OptionMenu with the same shape (a list of label/icon/onClick options).
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'
import IconButton from '@/components/ui/IconButton'

export type RowAction = {
  text: string
  icon?: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
}

type RowActionsProps = {
  options: RowAction[]

  /** Names the record the menu belongs to, e.g. "Royal Oud" — so a screen
   *  reader user hears which row's menu they're on instead of twenty
   *  identical "More actions" buttons. */
  label?: string
}

const RowActions = ({ options, label }: RowActionsProps) => (
  <Dropdown
    align='end'
    itemLabels={options.map(option => option.text)}
    trigger={
      <IconButton size='sm' aria-label={label ? `Actions for ${label}` : 'More actions'}>
        <i className='tabler-dots-vertical' />
      </IconButton>
    }
  >
    {options.map(option => (
      <DropdownItem
        key={option.text}
        danger={option.danger}
        disabled={option.disabled}
        icon={option.icon ? <i className={option.icon} /> : undefined}
        onClick={option.onClick}
      >
        {option.text}
      </DropdownItem>
    ))}
  </Dropdown>
)

export default RowActions
