// MUI Imports
import type { Theme } from '@mui/material'

// Type Imports
import type { Skin } from '@core/types'

const drawer = (skin: Skin): Theme['components'] => ({
  MuiDrawer: {
    defaultProps: {
      ...(skin === 'bordered' && {
        PaperProps: {
          elevation: 0
        }
      })
    },
    styleOverrides: {
      paper: {
        // Set explicitly (not just via globals.css) so the drawer surface is
        // guaranteed opaque regardless of any external stylesheet cascade —
        // this is the same mechanism MUI uses for every other override here.
        backgroundColor: 'var(--mui-palette-background-paper)',
        border: '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.35)',
        ...(skin !== 'bordered' && {
          boxShadow: 'var(--mui-customShadows-lg)'
        })
      }
    }
  }
})

export default drawer
