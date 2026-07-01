// Al Madina brand swatches offered by the theme customizer. The first entry is
// the default primary (gold). All values come from the central brand palette.
import { Palette } from './palette'

export type PrimaryColorConfig = {
  name?: string
  light?: string
  main: string
  dark?: string
}

// Primary color config object — on-brand options only (no arbitrary colours).
const primaryColorConfig: PrimaryColorConfig[] = [
  {
    name: 'primary-gold',
    light: Palette.goldBright,
    main: Palette.gold,
    dark: Palette.bronze
  },
  {
    name: 'primary-antique-gold',
    light: Palette.champagne,
    main: Palette.antiqueGold,
    dark: Palette.bronzeDeep
  },
  {
    name: 'primary-emerald',
    light: Palette.emeraldLight,
    main: Palette.emerald,
    dark: '#0A3D25'
  },
  {
    name: 'primary-burgundy',
    light: Palette.burgundyLight,
    main: Palette.burgundy,
    dark: '#43121F'
  },
  {
    name: 'primary-bronze',
    light: Palette.antiqueGold,
    main: Palette.bronze,
    dark: Palette.bronzeDeep
  }
]

export default primaryColorConfig
