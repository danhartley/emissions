import { DB, STORE } from '../common/constants'

export const getStore = () => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-undef
    const dbOpenRequest = indexedDB.open(DB, 1)

    dbOpenRequest.onsuccess = async () => {
      const db = dbOpenRequest.result
      const tx = db.transaction(STORE, 'readwrite')
      const store = tx.objectStore(STORE)
      resolve(store)
    }

    dbOpenRequest.onerror = (event) => {
      reject(new Error(`${event}`))
    }
  })
}
