import { compressionRates } from './constants'
export const isNode = () => {
  return !(
    // eslint-disable-next-line no-undef
    (window && typeof window !== 'undefined' && typeof document !== 'undefined')
  )
}

export const isBrowser = () => {
  return (
    // eslint-disable-next-line no-undef
    window && typeof window !== 'undefined' && typeof document !== 'undefined'
  )
}

export const sortBy = ({ arr, prop, dir = 'asc' }) => {
  return dir === 'asc'
    ? arr.sort((a, b) => {
        const x = a[prop]
        const y = b[prop]
        return x - y
      })
    : arr.sort((a, b) => {
        const x = a[prop]
        const y = b[prop]
        return y - x
      })
}

export const getBytes = ({
  compressedBytes,
  uncompressedBytes,
  encoding,
  compressionOptions,
}) => {
  if (compressedBytes !== 0) return compressedBytes

  return (
    compressUncompressedBytes({
      encoding,
      bytes: uncompressedBytes,
      compressionOptions,
    }) || 0
  )
}

export const compressUncompressedBytes = ({
  encoding,
  bytes,
  compressionOptions,
}) => {
  // default compression rates
  let BR = compressionRates.brotli.find((b) => b.level === 3).rate
  let GZIP = compressionRates.gzip.find((g) => g.level === 5).rate
  let DEFLATE = 1 // tbd
  let ZSTD = 1 // tbd

  if (compressionOptions) {
    BR =
      compressionRates.brotli.find((b) => b.level === compressionOptions.br)
        ?.rate || BR
    GZIP =
      compressionRates.gzip.find((g) => g.level === compressionOptions.gzip)
        ?.rate || GZIP
  }

  let ratio
  switch (encoding) {
    case 'br':
      ratio = BR
      break
    case 'gzip':
      ratio = GZIP
      break
    case 'deflate':
      ratio = DEFLATE
      break
    case 'zstd':
      ratio = ZSTD
      break
    default:
      ratio = 1
  }

  return Math.round(bytes / ratio)
}

const getDomainByPatternMatching = ({ url }) => {
  let result
  let match
  if (
    (match = url.match(
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?=]+)/im
    ))
  ) {
    result = match[1]
    if ((match = result.match(/^[^.]+\.(.+\..+)$/))) {
      result = match[1]
    }
  }
  return result
}

export const getDomainFromURL = (url) => {
  try {
    const parsedURL = new URL(url)
    let hostname = parsedURL.hostname

    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4)
    }

    return hostname
  } catch (e) {
    // If the built in parser fails, as it will for e.g. bbcorp.fr, use pattern matching
    if (e.code === 'ERR_INVALID_URL') {
      return getDomainByPatternMatching({ url })
    }
  }
}

export const format = ({
  number,
  locale = 'en-GB',
  minimumFractionDigits = 0,
  maximumFractionDigits = 2,
}) => {
  // return number
  return (
    number?.toLocaleString(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }) || 'n/a'
  )
}

export const parseName = (name) => {
  if (name === undefined || name === null) return ''
  const qs = name.indexOf('?')
  return qs > -1
    ? name.slice(0, qs) // remove querystring parameters
    : name
}

export const parseDomain = (name) => {
  const pretty = name.indexOf('/')
  return pretty > -1
    ? name.slice(0, pretty) // remove pretty parameters
    : name
}

export const logOut = ({ title, data }) => {
  console.log('\n')
  console.warn(title)
  console.table(data)
}

export const entryTypes = () => {
  return [
    'element',
    'event',
    'first-input',
    'largest-contentful-paint',
    'layout-shift',
    'long-animation-frame',
    'longtask',
    'mark',
    'measure',
    'navigation',
    'paint',
    'resource',
    'visibility-state',
  ]
}

export const entryTypesProfiled = () => {
  return ['navigation', 'resource']
}

export const getHostingOptions = (options, domain) => {
  if (options?.hostingOptions) {
    return {
      domain,
      options: {
        ...options.hostingOptions,
      },
    }
  }
  return { domain }
}

// Helper function to use aysnc/await with timers
export const pause = async ({ func, delay = 2000 }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(func())
    }, delay)
  })
}
