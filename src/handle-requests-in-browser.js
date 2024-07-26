import { getResponseDetails } from './common/response.js'
import { saveNetworkTraffic } from './db/save-network-traffic'

export const fetchHandler = (event) => {
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request)
        const clonedResponse = response.clone()
        const responseDetails = await getResponseDetails(
          clonedResponse,
          'browser'
        )

        if (responseDetails) {
          await saveNetworkTraffic(responseDetails)
        }

        return response
      } catch (e) {
        console.log(e)
      }
    })()
  )
}
