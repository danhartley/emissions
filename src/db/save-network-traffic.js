import { openDatabase } from './open-database.js'
import { STORE } from '../common/constants'

export const saveNetworkTraffic = async (responseDetails) => {
  const db = await openDatabase()
  const tx = db.transaction(STORE, 'readwrite')
  const emissions = tx.objectStore(STORE)

  const record = {
    url: responseDetails.url,
    bytes: responseDetails.bytes,
    uncompressedBytes: responseDetails.uncompressedBytes,
    contentType: responseDetails.contentType,
    resourceType: responseDetails.resourceType,
  }

  await emissions.add(record)

  db.close()
}
