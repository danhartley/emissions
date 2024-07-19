import { parseName } from './utils.js'

const acceptedStatuses = [200, 304]

export const processResponse = async (response, entries) => {
  try {

    const status = response.status()    

    if (!response || !acceptedStatuses.includes(status)) {
      return response
    }

    const url = response.url()

    const buffer = await response.buffer()
    const uncompressedBytes = buffer.length
    const compressedContentLength = response.headers()['content-length']
    const compressedBytes = compressedContentLength
      ? parseInt(compressedContentLength, 10)
      : 0
    const type = response.headers()['content-type']
    const encoding = response.headers()['content-encoding'] || 'n/a'
    const resourceType = response.request().resourceType()    
    const name = parseName(url)

    if(entries.find(e => e.name === name)) return

    entries.push({
      name,
      type,
      compressedBytes,
      uncompressedBytes,
      encoding,
      resourceType,
    })
  } catch(e) {
    console.log(e)
  }
}
