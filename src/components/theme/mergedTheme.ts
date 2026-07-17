/*
 * Al Madina theme overrides. We keep the `@core` theme pristine and layer the
 * brand palette on top here via deepmerge. Because every component reads the MUI
 * CSS variables (`--mui-palette-*`), retinting the palette + text channels below
 * cascades brand colours across the entire UI (sidebar, cards, tables, buttons,
 * chips, dialogs, drawers, toasts, skeletons, hover/active/disabled states).
 *
 * Primary colour (gold) is applied separately from `settings.primaryColor` in
 * `@components/theme/index.tsx`; here we set its contrastText plus the rest of
 * the brand palette. Component-level polish (glass surfaces, bronze borders,
 * table separators, card hover lift, chip pill styling, sidebar indicator) that
 * would otherwise require replacing `@core`'s style functions wholesale (and
 * losing their built-in variant/disabled/transition logic under deepmerge) lives
 * in `src/app/globals.css` instead, targeting stable MUI class names.
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

// Per-component "extendTheme" custom slots MUI reads for Tooltip/Snackbar/Avatar
// default styling — the stock theme hardcodes an off-brand dark grey here.
const componentSlots = (surface: string, avatarBg: string) => ({
  Tooltip: { bg: surface },
  SnackbarContent: { bg: surface, color: Palette.ivory },
  Avatar: { defaultBg: avatarBg }
})

const mergedTheme = (settings: Settings, mode: SystemMode, direction: Theme['direction']) => {
  const userTheme = {
    // Dark text on light surfaces (rich black), light text on dark surfaces (ivory).
    mainColorChannels: {
      light: toChannel(Palette.richBlack),
      dark: toChannel(Palette.ivory),
      lightShadow: toChannel(Palette.richBlack),
      darkShadow: toChannel(Palette.obsidian)
    },

    // Premium hierarchy — refined sans weights/tracking. Font family, sizes,
    // and line-heights inherit from the core theme (Public Sans throughout).
    typography: {
      h1: { fontWeight: 600, letterSpacing: '-0.01em' },
      h2: { fontWeight: 600, letterSpacing: '-0.01em' },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      overline: { fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }
    },
    colorSchemes: {
      light: {
        palette: {
          primary: { contrastText: Palette.richBlack },
          ...semantic,
          text: {
            primary: `rgb(${toChannel(Palette.richBlack)} / 0.92)`,
            secondary: Palette.slate,
            disabled: Palette.stone
          },
          divider: `rgb(${toChannel(Palette.bronze)} / 0.18)`,
          background: {
            // Background = Pearl, Cards/paper = Ivory, secondary surfaces = Sand
            // (via customColors below).
            default: settings.skin === 'bordered' ? Palette.white : Palette.pearl,
            paper: Palette.ivory,
            paperChannel: toChannel(Palette.ivory)
          },
          customColors: {
            bodyBg: Palette.pearl,
            chatBg: Palette.sand,
            greyLightBg: Palette.sand,
            tableHeaderBg: Palette.sand,
            trackBg: Palette.sand
          },
          ...componentSlots(Palette.onyx, Palette.sand)
        }
      },
      dark: {
        palette: {
          primary: { contrastText: Palette.richBlack },
          ...semantic,
          text: {
            primary: `rgb(${toChannel(Palette.ivory)} / 0.92)`,
            secondary: Palette.stone,
            disabled: Palette.ash
          },
          divider: `rgb(${toChannel(Palette.bronze)} / 0.28)`,
          background: {
            // Background = Rich Black, secondary surfaces = Obsidian,
            // cards/paper = Charcoal, raised surfaces = Onyx (via glass CSS).
            default: settings.skin === 'bordered' ? Palette.obsidian : Palette.richBlack,
            paper: Palette.charcoal,
            paperChannel: toChannel(Palette.charcoal)
          },
          customColors: {
            bodyBg: Palette.richBlack,
            chatBg: Palette.obsidian,
            greyLightBg: Palette.obsidian,
            tableHeaderBg: Palette.onyx,
            trackBg: Palette.onyx
          },
          ...componentSlots(Palette.onyx, Palette.smoke)
        }
      }
    }
  } as unknown as Theme

  return deepmerge(coreTheme(settings, mode, direction), userTheme)
}

export default mergedTheme
