const acceptedStatuses = [200, 304]

const parseName = (name) => {
  const qs = name.indexOf('?')
  return qs > -1 
    ? name.slice(0,qs) // remove querystring parameters
    : name
}

export const processResponse = async (response, entries) => {
  try {
    const url = response.url()
    const status = response.status()
    const headers = response.headers()

    if (!acceptedStatuses.includes(status)) return // e.g. response body is unavailable for redirect responses

    const isCSS = url.includes('.css')
    // We want to exlude CSS for prefetched pages
    if(isCSS) {
      const age = headers['age']
      if(age) {
        if(Number(age) === 0) return
      } else {
        return
      }        
    }

    const buffer = await response.buffer()
    const uncompressedBytes = buffer.length
    const compressedContentLength = response.headers()['content-length']
    const compressedBytes = compressedContentLength
      ? parseInt(compressedContentLength, 10)
      : 0
    const type = response.headers()['content-type']
    const encoding = response.headers()['content-encoding']
    const resourceType = response.request().resourceType()
    const fromCache = response.fromCache()

    entries.push({
      url,
      name: parseName(url),
      status,
      type,
      compressedBytes,
      uncompressedBytes,
      encoding,
      fromCache,
      resourceType,
    })
  } catch(e) {
    console.log(e)
  }
}
