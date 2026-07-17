// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Skin } from '@core/types'

const popover = (skin: Skin): Theme['components'] => ({
  MuiPopover: {
    styleOverrides: {
      paper: {
        backgroundColor: 'var(--mui-palette-background-paper)',
        border: '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.35)',
        ...(skin === 'bordered'
          ? { boxShadow: 'none' }
          : {
              boxShadow: 'var(--mui-customShadows-sm)'
            })
      }
    }
  }
})

export default popover
