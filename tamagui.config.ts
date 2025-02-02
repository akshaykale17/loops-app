import { createFont, createTamagui } from 'tamagui'
import { config } from '@tamagui/config/v3'

const mySystemFont = createFont({
  family: 'System',
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 22,
    9: 30,
    10: 42,
    11: 52,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 124,
  },
  lineHeight: {
    1: 14,
    2: 15,
    3: 16,
    4: 17,
    5: 20,
    6: 22,
    7: 24,
    8: 26,
    9: 36,
    10: 50,
    11: 62,
    12: 74,
    13: 86,
    14: 110,
    15: 136,
    16: 148,
  },
  weight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
})

const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    ...config.fonts,
    heading: mySystemFont,
    body: mySystemFont,
  },
})

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}