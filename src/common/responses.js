import { getBytes, sortBy } from './utils.js'

export const groupByType = (responses) => {
  return responses.reduce((acc, item) => {
    const { resourceType, ...rest } = item
    if (!acc[resourceType]) {
      acc[resourceType] = []
    }
    acc[resourceType].push(rest)
    return acc
  }, {})
}

export const groupByTypeBytes = (groupedByType) => {
  const groupedByTypeBytes = []
  for (let [key] of Object.entries(groupedByType)) {
    if(key !== 'undefined') {
      groupedByType[key] = sortBy({
        arr: groupedByType[key],
        prop: 'bytes',
        dir: 'desc',
      })
  
      const groupBytes = {
        type: key,
        bytes: groupedByType[key].reduce((acc, curr) => acc + curr.bytes, 0),
        uncachedBytes: groupedByType[key].reduce((acc, curr) => {
          const uncached = curr.fromCache ? 0 : curr.uncompressedBytes
          return acc + uncached
        }, 0),
        count: groupedByType[key].length,
      }
      groupedByTypeBytes.push(groupBytes)
    }
  }
  return groupedByTypeBytes
}

export const processResponses = (responses, compressionOptions) => {

  const validResponses = responses.filter(res => res)
  
  validResponses
  .forEach((res) => {
    res.bytes = getBytes({
      compressedBytes: res.compressedBytes,
      uncompressedBytes: res.uncompressedBytes,
      encoding: res.encoding,
      compressionOptions,
    })
  })

  const groupedByType = groupByType(validResponses)
  const groupedByTypeBytes = groupByTypeBytes(groupedByType)

  const totalBytes = groupedByTypeBytes.reduce(
    (acc, curr) => acc + (curr?.bytes || 0),
    0
  ) || 0

  const totalUncachedBytes = groupedByTypeBytes.reduce(
    (acc, curr) => acc + curr.uncachedBytes,
    0
  )

  return {
      totalBytes: totalBytes || 0,
      groupedByType,
      groupedByTypeBytes,
      totalUncachedBytes,
  }
}