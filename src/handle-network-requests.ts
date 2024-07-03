import { isBrowser, isNode } from './common/utils'

const DB = 'emissionsDB'
const STORE = 'emissions'

const openDatabase = async (): Promise<IDBDatabase> => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(DB, 1)

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db: IDBDatabase = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "url" })
        // db.createObjectStore(STORE, { autoIncrement: true })
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

// Define the interface for the requestResponse object
interface RequestResponse {
  url: string
  requestBytes: number
  contentType?: string
  responseBytes: number
}

// Assuming openDatabase function is defined as per the previous conversion
// declare function openDatabase(): Promise<IDBDatabase>

const saveNetworkTraffic = async (requestResponse: RequestResponse): Promise<void> => {
  const db: IDBDatabase = await openDatabase()
  const tx: IDBTransaction = db.transaction(STORE, 'readwrite')
  const emissions: IDBObjectStore = tx.objectStore(STORE)
  emissions.add(requestResponse)
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve
    tx.onerror = tx.onabort = reject
  })
  db.close()
}

// Define the interface for the records stored in the database
interface NetworkTrafficRecord {
  url: string;
  requestBytes: number;
  contentType?: string;
  responseBytes: number;
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

try {
  self.addEventListener('fetch', (event: FetchEvent) => {
    // console.log('Intercepting:', event.request.url)

    event.respondWith(
      (async () => {
        // Check for cached response
        // const cache = await caches.open('emissions-cache')
        // const cachedResponse = await cache.match(event.request)

        // if (cachedResponse) {
        //     console.log('Serving from cache:', event.request.url)
        //     return cachedResponse
        // }

        // Request details
        const requestClone: Request = event.request.clone()
        const requestBody: string = await requestClone.text()
        const requestSize: number = new TextEncoder().encode(requestBody).length

        const networkResponse: Response = await fetch(event.request)
        const clonedResponse: Response = networkResponse.clone()

        // Response details
        const responseBody: string = await clonedResponse.text()
        const responseSize: number = new TextEncoder().encode(responseBody).length
        const compressedResponseSize: string | null = networkResponse.headers.get('Content-Length')
        const contentType: string | null = networkResponse.headers.get('Content-Type')

        // Save request and response details to browser db
        await saveNetworkTraffic({
          url: event.request.url,
          requestBytes: requestSize,
          contentType: contentType || undefined,
          responseBytes: Number(compressedResponseSize || responseSize)
        })

        // Cache the response
        // if(event.request.method === 'GET') {
        //   cache.put(event.request, networkResponse.clone())
        // }

        return networkResponse
      })()
    )
  })
} catch (e) {
  console.log('node environment does not support service workers')
}

// Define the interface for the saveNetworkTraffic function argument
interface NetworkTrafficDetails {
  url: string
  requestBytes: number
  contentType?: string
  responseBytes: number
}

// Assume saveNetworkTraffic is defined elsewhere with the following signature
// declare function saveNetworkTraffic(details: NetworkTrafficDetails): Promise<void>