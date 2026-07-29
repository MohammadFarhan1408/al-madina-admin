'use client'

// Row-level "⋮" action menu used by the list views — replaces @core's
// OptionMenu with the same shape (a list of label/icon/onClick options).
import Dropdown, { DropdownItem } from '@/components/ui/Dropdown'

export type RowAction = {
  text: string
  icon?: string
  danger?: boolean
  onClick: () => void
}

const RowActions = ({ options }: { options: RowAction[] }) => (
  <Dropdown
    align='end'
    trigger={
      <button type='button' aria-label='More actions' className='rounded-md p-1.5 text-textSecondary hover:bg-primary/10'>
        <i className='tabler-dots-vertical text-lg' />
      </button>
    }
  >
    {options.map(option => (
      <DropdownItem
        key={option.text}
        danger={option.danger}
        icon={option.icon ? <i className={option.icon} /> : undefined}
        onClick={option.onClick}
      >
        {option.text}
      </DropdownItem>
    ))}
  </Dropdown>
)

export default RowActions
