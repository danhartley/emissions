import { openDatabase } from './open-database'
import { STORE } from '../common/constants'

export const saveNetworkTraffic = async requestResponse => {
  const db = await openDatabase()
  const tx = db.transaction(STORE, 'readwrite')
  const emissions = tx.objectStore(STORE)
  
  // Add a new record (request and response) to our browser db
  emissions.add(requestResponse)
  
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = tx.onabort = reject
  })
  db.close()
}