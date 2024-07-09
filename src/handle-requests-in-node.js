import { getBytes, sortBy } from './common/utils'
import { getEmissions } from './calculator'

export const runChecks = async (page, url, hostingOptions) => {

  const ignorable = [
    'Could not load body for this request. This might happen if the request is a preflight request.'
  ]

  let responses = []

  page.on('response', async response => {
    try {
      const url = response.url()
      const buffer = await response.buffer()
      const uncompressedBytes = buffer.length
      const compressedContentLength = response.headers()['content-length']
      const compressedBytes = compressedContentLength ? parseInt(compressedContentLength, 10) : 0
      const type = response.headers()['content-type']
      const encoding = response.headers()['content-encoding']
      const status = response.status()
      const resourceType = response.request().resourceType()
      const fromCache = response.fromCache()

      responses.push({
        url,
        status,
        type,
        compressedBytes,
        uncompressedBytes,
        encoding,
        fromCache,
        resourceType
      })
    } catch (e) {
      if (!ignorable.includes(e.message)) {
        console.log(response.url())
        console.error(e.message)
      }
    }
  })

  await page.goto(url)

  responses.forEach(res => {
    res.bytes = getBytes({
      compressedBytes: res.compressedBytes,
      uncompressedBytes: res.uncompressedBytes,
      encoding: res.encoding
    })
  })

  const groupedByType = responses.reduce((acc, item) => {
    const { resourceType, ...rest } = item
    if (!acc[resourceType]) {
      acc[resourceType] = []
    }
    acc[resourceType].push(rest)
    return acc
  }, {})

  const groupedByTypeBytes = []

  for (let [key, value] of Object.entries(groupedByType)) {
    if (groupedByType.hasOwnProperty(key)) {
      groupedByType[key] = sortBy({ arr: groupedByType[key], prop: 'bytes', dir: 'desc' })
      const groupBytes = {
        type: key,
        bytes: groupedByType[key].reduce((acc, curr) => acc + curr.bytes, 0),
        uncachedBytes: groupedByType[key].reduce((acc, curr) => {
          const uncached = curr.fromCache ? 0 : curr.uncompressedBytes
          return acc + uncached
        }, 0),
        count: groupedByType[key].length
      }
      groupedByTypeBytes.push(groupBytes)
    }
  }

  const totalBytes = groupedByTypeBytes.reduce((acc, curr) => acc + curr.bytes, 0)
  const totalUncachedBytes = groupedByTypeBytes.reduce((acc, curr) => acc + curr.uncachedBytes, 0)
  const { emissions, isGreen } = await getEmissions({ bytes: totalBytes, hostingOptions })

  return {
    totalBytes,
    count: responses.length,
    emissions,
    isGreen,
    data: {
      groupedByType,
      groupedByTypeBytes,
      totalUncachedBytes
    }
  }
}
