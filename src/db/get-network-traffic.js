import { getEmissions } from '../calculator.js'
import { openDatabase } from './open-database.js'
import { format, getHostingOptions } from '../common/utils.js'
import { getDomainFromURL } from '../common/utils.js'

import { STORE } from '../common/constants'

export const getNetworkTraffic = async (url, options) => {
  try {

    const domain = getDomainFromURL(url)
     
    const db = await openDatabase()
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    
    const traffic = {
      domain,
      pageWeight: 0,
      responses: [],
      count: 0,
      emissions: 0,
      mgCO2: 0,
      greenHosting: false,
    }

    const records = await getRecords(store)
    const bytes = records.reduce((acc, curr) => acc + curr.bytes, 0)
    const { emissions, greenHosting } = await getEmissions({
      bytes,
      hostingOptions: getHostingOptions(options, domain),
    })

    traffic.pageWeight = bytes
    traffic.responses = records
    traffic.count = records.length
    traffic.emissions = emissions
    traffic.mgCO2 = format({ number: emissions * 1000 })
    traffic.greenHosting = greenHosting
    traffic.records = records

    return traffic
    
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
