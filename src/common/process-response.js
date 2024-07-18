import { parseName } from './utils.js'

const acceptedStatuses = [200, 304]

export const processResponse = async (response, entries) => {
  try {

    const status = response.status()    

    if (!response || !acceptedStatuses.includes(response.status())) {
      return response
    }

    const url = response.url()
    // const headers = response.headers()

    // const isCSS = url.includes('.css')
    // // We want to exlude CSS for prefetched pages
    // if(isCSS) {
    //   const age = headers['age']
    //   if(age) {
    //     if(Number(age) === 0) return
    //   } else {
    //     return
    //   }        
    // }

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
