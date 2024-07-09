export const isNode = () => {
  return !(window && typeof window !== 'undefined' && typeof document !== 'undefined')
}

export const isBrowser = () => {
  return window && typeof window !== 'undefined' && typeof document !== 'undefined'
}

export const sortBy = ({arr, prop, dir = 'asc'}) => {
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

export const getBytes = ({compressedBytes, uncompressedBytes, encoding}) => {
  if(compressedBytes !== 0) return compressedBytes

  return compressUncompressedBytes({
    encoding,
    bytes: uncompressedBytes,
    ratios: {}
  })
}

export const compressUncompressedBytes = ({encoding, bytes, ratios}) => {
  // default compression rates
  const BR = 5.48 // level 6 of 12 (0-11)
  const GZIP = 4.97 // level 5 of 9 (1-9)
  const DEFLATE = 1 // tbd
  const ZSTD = 1 // tbd

  const { gzip = GZIP , br = BR, deflate = DEFLATE, zstd = ZSTD } = ratios

  let ratio
  switch(encoding) {
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

