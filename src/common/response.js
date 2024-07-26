import { getBytes } from './utils.js'

export const getResponseDetails = async (response, env, compressionOptions) => {
  const acceptedStatuses = [200, 304]
  const status = env === 'browser' ? response.status : response.status()

  if (!response || !acceptedStatuses.includes(status)) {
    return null
  }

  const isBrowser = env === 'browser'
  const isNode = env === 'node'

  const getHeader = (header) =>
    isBrowser
      ? response.headers.get(header)
      : response.headers()[header.toLowerCase()]
  const getBuffer = async () =>
    isBrowser ? response.arrayBuffer() : response.buffer()

  const url = isBrowser ? response.url : response.url()
  const contentLength = getHeader('Content-Length')
  const contentType = getHeader('Content-Type')
  const contentEncoding = getHeader('Content-Encoding') || 'n/a'
  const buffer = await getBuffer()

  const uncompressedBytes = buffer.length
  const compressedBytes = contentLength ? parseInt(contentLength, 10) : 0
  const bytes = getBytes({
    compressedBytes,
    uncompressedBytes,
    encoding: contentEncoding,
    compressionOptions,
  })

  let resourceType

  if (isNode) {
    resourceType = response.request().resourceType()
  }

  if (isBrowser) {
    if (contentType.includes('text/html')) {
      resourceType = 'document'
    } else if (contentType.includes('application/javascript')) {
      resourceType = 'script'
    } else if (contentType.includes('image/')) {
      resourceType = 'image'
    } else {
      resourceType = 'other'
    }
  }

  return {
    url,
    contentType,
    compressedBytes,
    uncompressedBytes,
    bytes,
    encoding: contentEncoding,
    resourceType,
  }
}

export const processResponse = async (response, compressionOptions) => {
  try {
    return await getResponseDetails(response, 'node', compressionOptions)
  } catch (e) {
    console.log(e)
  }
}
