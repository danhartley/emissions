import { openDatabase } from './open-database'
import { STORE } from '../common/constants'

export const saveNetworkTraffic = async (requestResponse) => {
  const db = await openDatabase()
  const tx = db.transaction(STORE, 'readwrite')
  const emissions = tx.objectStore(STORE)

  // Query the db for an entry with the key of the new record we want to add
  const request = emissions.get(requestResponse.url)

  request.onsuccess = (event) => {
    // There is no entry for this key, so we create a new record
    if (!event.target.result) {
      emissions.add(requestResponse)
    } else {
      // There is already an entry for this key, so we do nothing
    }
  }
  request.onerror = (event) => {
    // There was an error checking for an existing record
  }

  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = tx.onabort = reject
  })
  db.close()
}
