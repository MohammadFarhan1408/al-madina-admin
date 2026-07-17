//MUI Imports
import type { Theme } from '@mui/material/styles'

//Type Imports
import type { Skin } from '@core/types'

const dialog = (skin: Skin): Theme['components'] => ({
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        // Set explicitly (not just via globals.css) so the dialog surface is
        // guaranteed opaque regardless of any external stylesheet cascade —
        // this is the same mechanism MUI uses for every other override here.
        backgroundColor: 'var(--mui-palette-background-paper)',
        border: '1px solid rgb(var(--mui-palette-secondary-mainChannel) / 0.35)',
        borderRadius: 'var(--mui-shape-customBorderRadius-lg)',
        ...(skin !== 'bordered'
          ? {
              boxShadow: 'var(--mui-customShadows-lg)'
            }
          : {
              boxShadow: 'none'
            }),
        [theme.breakpoints.down('sm')]: {
          '&:not(.MuiDialog-paperFullScreen)': {
            margin: theme.spacing(6)
          }
        }
      }),
      paperFullScreen: {
        borderRadius: 0
      }
    }
  },
  MuiDialogTitle: {
    defaultProps: {
      variant: 'h5'
    },
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(6),
        '& + .MuiDialogActions-root': {
          paddingTop: 0
        }
      })
    }
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(6),
        '& + .MuiDialogContent-root, & + .MuiDialogActions-root': {
          paddingTop: 0
        }
      })
    }
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(6),
        '& .MuiButtonBase-root:not(:first-of-type)': {
          marginInlineStart: theme.spacing(4)
        },
        '&:where(.dialog-actions-dense)': {
          padding: theme.spacing(3),
          '& .MuiButton-text': {
            paddingInline: theme.spacing(3)
          }
        }
      })
    }
  }
})

export default dialog
