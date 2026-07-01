/*
 * Al Madina theme overrides. We keep the `@core` theme pristine and layer the
 * brand palette on top here via deepmerge. Because every component reads the MUI
 * CSS variables (`--mui-palette-*`), retinting the palette + text channels below
 * cascades brand colours across the entire UI (sidebar, cards, tables, buttons,
 * chips, dialogs, drawers, toasts, skeletons, hover/active/disabled states).
 *
 * Primary colour (gold) is applied separately from `settings.primaryColor` in
 * `@components/theme/index.tsx`; here we only set its contrastText.
 */

// MUI Imports
import { deepmerge } from '@mui/utils'
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Settings } from '@core/contexts/settingsContext'
import type { SystemMode } from '@core/types'

// Core Theme Imports
import coreTheme from '@core/theme'

// Config Imports
import { Palette, toChannel } from '@configs/palette'

// Shared semantic colours (read well on both light ivory and dark obsidian).
const semantic = {
  secondary: { main: Palette.bronze, light: Palette.antiqueGold, dark: Palette.bronzeDeep, contrastText: Palette.white },
  error: { main: Palette.error, light: Palette.burgundyLight, dark: '#8E2D38', contrastText: Palette.white },
  warning: { main: Palette.warning, light: Palette.goldBright, dark: Palette.bronzeDeep, contrastText: Palette.richBlack },
  info: { main: Palette.info, light: '#5C8AAC', dark: '#2C5169', contrastText: Palette.white },
  success: { main: Palette.success, light: Palette.emeraldLight, dark: Palette.emerald, contrastText: Palette.white }
}

const mergedTheme = (settings: Settings, mode: SystemMode, direction: Theme['direction']) => {
  const userTheme = {
    // Dark text on light surfaces (rich black), light text on dark surfaces (ivory).
    mainColorChannels: {
      light: toChannel(Palette.richBlack),
      dark: toChannel(Palette.ivory),
      lightShadow: toChannel(Palette.richBlack),
      darkShadow: toChannel(Palette.obsidian)
    },

    // Premium hierarchy refinement — heavier headings + tighter tracking. Sizes,
    // line-heights and the Public Sans family are inherited from the core theme.
    typography: {
      h1: { fontWeight: 600, letterSpacing: '-0.02em' },
      h2: { fontWeight: 600, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.015em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      overline: { fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }
    },
    colorSchemes: {
      light: {
        palette: {
          primary: { contrastText: Palette.richBlack },
          ...semantic,
          background: {
            default: settings.skin === 'bordered' ? Palette.white : Palette.ivory,
            paper: Palette.pearl,
            paperChannel: toChannel(Palette.pearl)
          },
          customColors: {
            bodyBg: Palette.ivory,
            chatBg: Palette.ivoryDim,
            greyLightBg: Palette.pearl,
            tableHeaderBg: Palette.pearl,
            trackBg: Palette.ivoryDim
          }
        }
      },
      dark: {
        palette: {
          primary: { contrastText: Palette.richBlack },
          ...semantic,
          background: {
            default: settings.skin === 'bordered' ? Palette.obsidian : Palette.richBlack,
            paper: Palette.obsidian,
            paperChannel: toChannel(Palette.obsidian)
          },
          customColors: {
            bodyBg: Palette.richBlack,
            chatBg: Palette.charcoal,
            greyLightBg: Palette.charcoal,
            tableHeaderBg: Palette.charcoal,
            trackBg: Palette.onyx
          }
        }
      }
    }
  } as unknown as Theme

  return deepmerge(coreTheme(settings, mode, direction), userTheme)
}

export default mergedTheme
