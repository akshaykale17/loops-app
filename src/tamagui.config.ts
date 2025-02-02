import { createTamagui, createTokens } from 'tamagui'

const tokens = createTokens({
  color: {
    pinkDark: '#610c62',
    pinkLight: '#f17efc',
  }
})
export default createTamagui({
  tokens,
  themes: {
    dark: {
      background: '#000',
      color: '#fff',
    },
    light: {
      color: '#000',
      background: '#fff',
    },
    dark_pink: {
      background: tokens.color.pinkDark,
      color: tokens.color.pinkLight,
    },
    light_pink: {
      background: tokens.color.pinkLight,
      color: tokens.color.pinkDark,

    },

  },

})
