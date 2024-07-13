export const isNode = () => {
  return !(
    window &&
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  )
}

export const isBrowser = () => {
  return (
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

export const getBytes = ({ compressedBytes, uncompressedBytes, encoding }) => {
  if (compressedBytes !== 0) return compressedBytes

  return compressUncompressedBytes({
    encoding,
    bytes: uncompressedBytes,
    ratios: {},
  })
}

export const compressUncompressedBytes = ({ encoding, bytes, ratios }) => {
  // default compression rates
  const BR = 5.48 // level 6 of 12 (0-11)
  const GZIP = 4.97 // level 5 of 9 (1-9)
  const DEFLATE = 1 // tbd
  const ZSTD = 1 // tbd

  const { gzip = GZIP, br = BR, deflate = DEFLATE, zstd = ZSTD } = ratios

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
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im
    ))
  ) {
    result = match[1]
    if ((match = result.match(/^[^\.]+\.(.+\..+)$/))) {
      result = match[1]
    }
  }
  return result
}

export const getDomainFromURL = ({ url }) => {
  try {
    const parsedURL = new URL(url)
    let hostname = parsedURL.hostname

    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4)
    }

    return hostname
  } catch (e) {
    // If the built in parser fails, as it will for e.g. bbcorp.fr, use pattern matching
    return getDomainByPatternMatching({ url })
  }
}

export const format = ({ number, locale = 'en-GB' }) => {
  return number.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })
}
