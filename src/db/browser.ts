import { DB, STORE } from '../common/constants'
import { RequestResponse, NetworkTrafficRecord } from '../common/types'

const openDatabase = async (): Promise<IDBDatabase> => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(DB, 1)

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        // Use the request url as the record key
        db.createObjectStore(STORE, { keyPath: "url" })
      }
    }

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBOpenDBRequest).result)
    }

    request.onerror = (event: Event) => {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

export const saveNetworkTraffic = async (requestResponse: RequestResponse): Promise<void> => {
  const db: IDBDatabase = await openDatabase()
  const tx: IDBTransaction = db.transaction(STORE, 'readwrite')
  const emissions: IDBObjectStore = tx.objectStore(STORE)
  
  // Add a new record (request and response) to our browser db
  emissions.add(requestResponse)
  
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = tx.onabort = reject
  })
  db.close()
}

export const getNetworkTraffic = async (): Promise<NetworkTrafficRecord[]> => {  
  const db: IDBDatabase = await openDatabase()
  const tx: IDBTransaction = db.transaction(STORE, 'readwrite')
  const emissions: IDBObjectStore = tx.objectStore(STORE)

  const records: NetworkTrafficRecord[] = []

  return new Promise<NetworkTrafficRecord[]>((resolve, reject) => {
    const request = emissions.openCursor()

    request.onsuccess = (event: Event) => {
      const cursor: IDBCursorWithValue | null = (event.target as IDBRequest).result
      if (cursor) {
        records.push(cursor.value)
        cursor.continue()
      } else {
        console.log("No more entries!")
        resolve(records)
      }
    }

    request.onerror = (event: Event) => {
      reject((event.target as IDBRequest).error)
    }
  })
}
