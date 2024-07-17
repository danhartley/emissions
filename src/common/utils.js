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

export const getBytes = ({ compressedBytes, uncompressedBytes, encoding }) => {
  if (compressedBytes !== 0) return compressedBytes

  return compressUncompressedBytes({
    encoding,
    bytes: uncompressedBytes,
  })
}

export const compressUncompressedBytes = ({ encoding, bytes }) => {
  // default compression rates
  const BR = 5.48 // level 6 of 12 (0-11)
  const GZIP = 4.97 // level 5 of 9 (1-9)
  const DEFLATE = 1 // tbd
  const ZSTD = 1 // tbd

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
    console.log(e)
    return getDomainByPatternMatching({ url })
  }
}

export const format = ({ number, locale = 'en-GB', maximumFractionDigits = 2 }) => {
  return number.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits,
  })
}

export const parseName = (name) => {
  const qs = name.indexOf('?')
  return qs > -1 
    ? name.slice(0,qs) // remove querystring parameters
    : name
}

export const parseDomain = (name) => {
  const pretty = name.indexOf('/')
  return pretty > -1 
    ? name.slice(0,pretty) // remove pretty parameters
    : name
}

export const logOut = ({title, data}) => {
  console.log('\n')
  console.warn(title)
  console.table(data)
}

export const entryTypes = () => {
  return [
    "element",
    "event",
    "first-input",
    "largest-contentful-paint",
    "layout-shift",
    "long-animation-frame",
    "longtask",
    "mark",
    "measure",
    "navigation",
    "paint",
    "resource",
    "visibility-state" 
  ]
}

export const entryTypesProfiled = () => {
  return ['navigation', 'resource']
}
