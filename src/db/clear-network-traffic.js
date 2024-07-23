/* eslint-disable no-undef */
import { DB } from '../common/constants'

export const clearNetworkTraffic = async () => {
    const dbDeleteRequest = indexedDB.deleteDatabase(DB)
    
    dbDeleteRequest.onerror = () => {
      console.error("Error deleting database.")
    }
    
    dbDeleteRequest.onsuccess = (event) => {
      console.log("Database deleted successfully")
    
      console.log(event.result); // should be undefined
    }
}
