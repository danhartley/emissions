import { openDatabase } from './open-database.js'
import { STORE } from '../common/constants'
import { getBytes } from '../common/utils.js'

export const saveNetworkTraffic = async (responseDetails) => {
  const db = await openDatabase()
  const tx = db.transaction(STORE, 'readwrite')
  const emissions = tx.objectStore(STORE)

  const record = {
    url: responseDetails.url,
    bytes: getBytes({
      compressedBytes: responseDetails.compressedBytes,
        uncompressedBytes: responseDetails.uncompressedBytes,
        encoding: responseDetails.encoding,
    }),
    contentType: responseDetails.contentType,
    resourceType: responseDetails.resourceType
  }

  const request = await emissions.add(record)

  request.onsuccess = () => {
    // console.log('Record added to the db')
  }

  db.close()
}
