import { getEmissions } from '../calculator.js'
import { openDatabase } from './open-database.js'
import { getHostingOptions, pause } from '../common/utils.js'
import { output } from '../common/output.js'
import { getDomainFromURL } from '../common/utils.js'
import { processResponses } from '../common/responses.js'

import { STORE } from '../common/constants'

export const getNetworkTraffic = async (url, options) => {
  try {

    const domain = getDomainFromURL(url)
     
    const db = await openDatabase()
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)

    const records = await getRecords(store)
    const bytes = records.reduce((acc, curr) => acc + curr.bytes, 0)
    const { emissions, greenHosting } = await getEmissions({
      bytes,
      hostingOptions: getHostingOptions(options, domain),
    })

    // let groupedByType, groupedByTypeBytes, totalUncachedBytes

    // await pause({
    //   func: async () => {
    //     ({ groupedByType, groupedByTypeBytes, totalUncachedBytes } = processResponses(records, options?.compressionOptions))
  
    //   }, delay: 0
    // })

    const { groupedByType, groupedByTypeBytes, totalUncachedBytes } = processResponses(records)

    const report = output({
      url,
      bytes,
      greenHosting,
      responses: records,
      emissions,
      groupedByType,
      groupedByTypeBytes,
      totalUncachedBytes
    })

    return report
  } catch (error) {
    throw new Error(`Failed to get network traffic: ${error.message}`)
  }
}

const getRecords = (store) => {
  return new Promise((resolve, reject) => {
    const responses = []
    const request = store.openCursor()

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        responses.push(cursor.value)
        cursor.continue()
      } else {
        resolve(responses)
      }
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}
