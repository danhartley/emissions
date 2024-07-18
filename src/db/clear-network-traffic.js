import { getStore } from './get-store.js'

export const clearNetworkTraffic = async () => {
    const store = await getStore()

    const storeRequest = store.clear()
    storeRequest.onsuccess = () => {
      // report the success of our request
      console.log('Emissions store cleared')
    }
}
