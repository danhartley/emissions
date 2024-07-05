// import puppeteer from 'puppeteer'
import { setTimeout } from "node:timers/promises"
import { hosting, co2, averageIntensity, marginalIntensity } from "@tgwf/co2"
import { compressUncompressedBytes, sortBy } from './common/utils'

export const runChecks = async (page, url, options) => {

  const ignorable = [
    'Could not load body for this request. This might happen if the request is a preflight request.'
  ]

  let responses = []

  page.on('response', async (response) => {
    try {
      const url = response.url()
      const buffer = await response.buffer()
      const uncompressedBytes = buffer.length
      const compressedContentLength = response.headers()['content-length']
      const compressedBytes = compressedContentLength ? parseInt(compressedContentLength, 10) : 0
      const type = response.headers()['content-type']
      const encoding = response.headers()['content-encoding']
      const status = response.status()
      const resourceType = response.request()['resourceType']()
      const fromCache = response.fromCache()

      responses.push({
            url
          , status
          , type
          , compressedBytes
          , uncompressedBytes
          , encoding
          , fromCache
          , resourceType
      })
    } catch (e) {
      if(!ignorable.includes(e.message)) {
        console.log(response.url())
        console.error(e.message)
      }
    }
  })

  // Navigate to the website
  await page.goto(url)

  // Perform any other actions you need to capture responses
  await setTimeout(3000)

  responses.forEach(req => {
    req.bytes = req.compressedBytes === req.uncompressedBytes
      ? compressUncompressedBytes({encoding: req.encoding, bytes: req.uncompressedBytes})
      : req.compressedBytes
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
      groupedByType[key] = sortBy({arr: groupedByType[key], prop: 'bytes', dir: 'desc'})
      const groupBytes = {
          type: key
        , bytes: groupedByType[key].reduce((acc, curr) => acc + curr.bytes, 0)
        , uncachedBytes: groupedByType[key].reduce((acc, curr) => {
            const uncached = curr.fromCache ? 0 : curr.bytes
            return acc + uncached
          }, 0)
        , count: groupedByType[key].length
      }
      groupedByTypeBytes.push(groupBytes)
    }
  }

  // console.log(groupedByType)
  // console.log(sortBy({arr: responses.filter(res => res.resourceType === 'script'), prop: 'bytes', dir: 'desc'}))
  // console.log(groupedByTypeBytes)

  const totalBytes = groupedByTypeBytes.reduce((acc, curr) => acc + curr.bytes, 0)
  const totalUncachedBytes = groupedByTypeBytes.reduce((acc, curr) => acc + curr.uncachedBytes, 0)

  return {
      totalBytes
    , count: responses.length
  }
}

// try {
//   (async () => {
    
//       const methods = ['GET', 'POST']
//       const logTypes = ['image', 'xhr', 'script', 'document', 'stylesheet', 'ping', 'fetch', 'font', 'other']
//       const logStatuses = [200]

//       const co2Emission = new co2()
   
//   })()

// } catch (e) {
//   console.log('The browser development environment does not support server side requests.')
// }