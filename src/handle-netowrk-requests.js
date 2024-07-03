const DB = 'emissionsDB'
const STORE = 'emissions'

const openDatabase = async () => {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB, 1)
      request.onupgradeneeded = event => {
          const db = event.target.result        
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: "url" })
            // db.createObjectStore(STORE, { autoIncrement: true })
          }
      }
      request.onsuccess = event => {
          resolve(event.target.result)
      }
      request.onerror = event => {
          reject(event.target.error)
      }
  })
}

const saveNetworkTraffic = async requestResponse => {
  const db = await openDatabase()
  const tx = db.transaction(STORE, 'readwrite')
  const emissions = tx.objectStore(STORE)
  emissions.add(requestResponse)
  await tx.complete
  db.close()
}

export const getNetworkTraffic = async () => {
  const db = await openDatabase()
  const tx = db.transaction(STORE, 'readwrite')
  const emissions = tx.objectStore(STORE)

  const records = []

  return new Promise((resolve, reject) => {
    emissions.openCursor().onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        records.push(cursor.value)
        cursor.continue()      
      } else {
        console.log("No more entries!")
        resolve(records)
      }    
    }

    emissions.openCursor().onerror = (event) => {
      reject(event.target.error)
    }
  })  
}

self.addEventListener('fetch', event => {
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
          const requestClone = event.request.clone()
          const requestBody = await requestClone.text()
          const requestSize = new TextEncoder().encode(requestBody).length

          const networkResponse = await fetch(event.request)
          const clonedResponse = networkResponse.clone()

          // Response details
          const responseBody = await clonedResponse.text()
          const responseSize = new TextEncoder().encode(responseBody).length
          const compressedResponseSize = networkResponse.headers.get('Content-Length')
          const contentType = networkResponse.headers.get('Content-Type')

          // Save request and response details to browser db
          await saveNetworkTraffic({
              url: event.request.url
            , requestBytes: Number(requestSize)
            , contentType
            , responseBytes: Number(compressedResponseSize || responseSize)
          })

          // Cache the response
          // if(event.request.method === 'GET') {
          //   cache.put(event.request, networkResponse.clone())
          // }

          return networkResponse
      })()
  )
})
