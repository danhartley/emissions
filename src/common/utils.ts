export const isNode = (): boolean => {
  return !(window && typeof window !== 'undefined' && typeof document !== 'undefined')
}

export const isBrowser = (): boolean => {
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

const COMPRESSION_RATIO_BROTLI = 2.67
const COMPRESSION_RATIO_GZIP = 2.67

export const compressUncompressedBytes = ({encoding, bytes}) => {
  let ratio = 1
  switch(encoding) {
    case 'gzip':
      ratio = COMPRESSION_RATIO_GZIP
      break
    case 'br': // Brotli
      ratio = COMPRESSION_RATIO_BROTLI
      break
    default:
      ratio = 1
  }

  return Math.round(bytes / ratio)
  // return 0
}

