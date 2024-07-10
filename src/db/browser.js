// @ts-nocheck
// import { getEmissions } from '../calculator'
// import { DB, STORE } from '../common/constants'

// const openDatabase = async () => {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open(DB, 1)

//     request.onupgradeneeded = event => {
//       const db = event.target.result
//       if (!db.objectStoreNames.contains(STORE)) {
//         // Use the request url as the record key
//         db.createObjectStore(STORE, { keyPath: "url" })
//       }
//     }

//     request.onsuccess = event => {
//       resolve(event.target.result)
//     }

//     request.onerror = event => {
//       reject(event.target.error)
//     }
//   })
// }

// export const saveNetworkTraffic = async requestResponse => {
//   const db = await openDatabase()
//   const tx = db.transaction(STORE, 'readwrite')
//   const emissions = tx.objectStore(STORE)
  
//   // Add a new record (request and response) to our browser db
//   emissions.add(requestResponse)
  
//   await new Promise((resolve, reject) => {
//     tx.oncomplete = resolve
//     tx.onerror = tx.onabort = reject
//   })
//   db.close()
// }

// export const getNetworkTraffic = async ({domain}) => {
//   const db = await openDatabase()
//   const tx = db.transaction(STORE, 'readwrite')
//   const emissions = tx.objectStore(STORE)

//   const traffic = {
//     responses: [],
//     emissions: 0,
//     isGreen: false
//   }

//   return new Promise((resolve, reject) => {
//     const request = emissions.openCursor()
    
//     request.onsuccess = async event => {
//       const cursor = event.target.result
//       if (cursor) {
//         traffic.responses.push(cursor.value)
//         cursor.continue()
//       } else {
//         console.log("No more entries!")
//         const bytes = traffic.responses.reduce((acc, curr) => acc + curr.requestBytes, 0)
//         const hostingOptions = { domain }
//         // const { emissions, isGreen } = await getEmissions({bytes, hostingOptions})
//         // traffic.emissions = emissions
//         // traffic.isGreen = isGreen
//         resolve(traffic)
//       }
//     }

//     request.onerror = event => {
//       reject(event.target.error)
//     }
//   })
// }

