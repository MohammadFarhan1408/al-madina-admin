// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { VerticalNavState } from '@menu/contexts/verticalNavContext'
import type { MenuProps } from '@menu/vertical-menu'

// Util Imports
import { menuClasses } from '@menu/utils/menuClasses'

const menuSectionStyles = (verticalNavOptions: VerticalNavState, theme: Theme): MenuProps['menuSectionStyles'] => {
  // Vars
  const { isCollapsed, isHovered } = verticalNavOptions

  const collapsedNotHovered = isCollapsed && !isHovered

  return {
    root: {
      marginBlockStart: theme.spacing(0),
      [`& .${menuClasses.menuSectionContent}`]: {
        color: 'var(--mui-palette-secondary-main)',
        paddingInline: '12px !important',
        paddingBlock: `${theme.spacing(collapsedNotHovered ? 3.625 : 1.5)} !important`,
        marginBlockStart: theme.spacing(3.5),
        borderBlockStart: '1px solid var(--mui-palette-divider)',

        '&:before': {
          content: '""',
          blockSize: 1,
          inlineSize: '1.375rem',
          backgroundColor: 'var(--mui-palette-secondary-main)'
        },
        ...(!collapsedNotHovered && {
          '&:before': {
            content: 'none'
          }
        }),

        [`& .${menuClasses.menuSectionLabel}`]: {
          flexGrow: 0,
          textTransform: 'uppercase',
          fontSize: '11.5px',
          fontWeight: 600,
          lineHeight: 1.38462,
          letterSpacing: '1px',
          ...(collapsedNotHovered && {
            display: 'none'
          })
        }
      }
    }
  }
}

export default menuSectionStyles
