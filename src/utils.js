import * as WebBrowser from 'expo-web-browser'

export const BUILD_VERSION = '13'

export const openBrowserAsync = async (url) => {
  await WebBrowser.openBrowserAsync(url, {
    toolbarColor: '#000000',
    enableBarCollapsing: true,
    dismissButtonStyle: 'close',
    presentationStyle: 'popover',
  })
}

export const truncateText = (val, limit, suffix = '...') => {
  if (val && val.length > limit) {
    return val.slice(0, limit) + suffix
  }
  return val
}

export const _timeAgo = (ts) => {
  let date = Date.parse(ts)
  let seconds = Math.floor((new Date() - date) / 1000)
  let interval = Math.floor(seconds / 63072000)
  if (interval < 0) {
    return '0s'
  }
  if (interval >= 1) {
    return interval + 'y'
  }
  interval = Math.floor(seconds / 604800)
  if (interval >= 1) {
    return interval + 'w'
  }
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return interval + 'd'
  }
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return interval + 'h'
  }
  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return interval + 'm'
  }
  return Math.floor(seconds) + 's'
}

export function formatTimestampMonthYear(iso8601String) {
  const now = new Date()
  const timestamp = new Date(iso8601String)

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const year = timestamp.getFullYear()
  const month = monthNames[timestamp.getMonth()]

  return `${month} ${year}`
}

export const _timeAgoDaily = (ts) => {
  let date = Date.parse(ts)
  let fullDatePre = new Date(ts)
  if (Number.isNaN(fullDatePre)) {
    console.error('Invalid date')
    return null
  }
  let fullYear = fullDatePre.getFullYear()
  let fullDay = fullDatePre.getDate()
  let fullMonth = fullDatePre.getMonth() + 1
  const fullDate = `${fullYear}-${fullMonth.toString().padStart(2, '0')}-${fullDay.toString().padStart(2, '0')}`
  let seconds = Math.floor((new Date() - date) / 1000)
  let interval = Math.floor(seconds / 63072000)
  if (interval < 0) {
    return '0s'
  }
  if (interval >= 1) {
    return fullDate
  }
  interval = Math.floor(seconds / 604800)
  if (interval >= 1) {
    return fullDate
  }
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return fullDate
  }
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return interval + 'h'
  }
  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return interval + 'm'
  }
  return Math.floor(seconds) + 's'
}

export const _formatNumberCount = (value) => {
  const number = Number.parseInt(value, 10)

  if (Number.isNaN(number)) {
    return value
  }

  if (number < 1000) {
    return number.toString()
  }

  if (number < 100000) {
    const thousands = number / 1000
    return `${thousands.toFixed(1)}K`
  }

  if (number < 1000000) {
    const thousands = number / 1000
    return `${Math.floor(thousands)}K`
  }

  const millions = number / 1000000
  return `${millions.toFixed(1)}M`
}

export const generateUUID = () => {
  try {
    const randomBytes = new Uint8Array(16)
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256)
    }

    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80

    const hexValues = Array.from(randomBytes).map((byte) =>
      byte.toString(16).padStart(2, '0')
    )

    return [
      hexValues.slice(0, 4).join(''),
      hexValues.slice(4, 6).join(''),
      hexValues.slice(6, 8).join(''),
      hexValues.slice(8, 10).join(''),
      hexValues.slice(10, 16).join(''),
    ].join('-')
  } catch (error) {
    console.error('Error generating UUID:', error)
    return `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
