import { getResponseDetails } from './common/response.js'
import { saveNetworkTraffic } from './db/save-network-traffic'

export const fetchHandler = (event) => {
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request)
        const responseDetails = getResponseDetails(response)

        saveNetworkTraffic(responseDetails)

        return response
      } catch (e) {
        console.log(e)
      }
    })()
  )
}
