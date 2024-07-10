import { getEmissions } from '../calculator'
import { openDatabase } from './open-database'
import { STORE } from '../common/constants'

export const getNetworkTraffic = async ({domain}) => {
  const db = await openDatabase()
  const tx = db.transaction(STORE, 'readwrite')
  const emissions = tx.objectStore(STORE)

  const traffic = {
    responses: [],
    emissions: 0,
    isGreen: false
  }

  return new Promise((resolve, reject) => {
    const request = emissions.openCursor()
    
    request.onsuccess = async event => {
      const cursor = event.target.result
      if (cursor) {
        traffic.responses.push(cursor.value)
        cursor.continue()
      } else {
        console.log("No more entries!")
        const bytes = traffic.responses.reduce((acc, curr) => acc + curr.requestBytes, 0)
        const hostingOptions = { domain }
        const { emissions, isGreen } = await getEmissions({bytes, hostingOptions})
        traffic.emissions = emissions
        traffic.isGreen = isGreen
        resolve(traffic)
      }
    }

    request.onerror = event => {
      reject(event.target.error)
    }
  })
}