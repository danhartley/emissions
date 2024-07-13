import { saveNetworkTraffic } from './db/save-network-traffic'

export const fetchHandler = (event) => {
  event.respondWith(
    (async () => {
      try {
        // Request details
        const requestClone = event.request.clone()
        const requestBody = await requestClone.text()
        const requestSize = new TextEncoder().encode(requestBody).length

        // Response details
        const networkResponse = await fetch(event.request)
        const clonedResponse = networkResponse.clone()

        const responseBody = await clonedResponse.text()
        const responseSize = new TextEncoder().encode(responseBody).length
        const compressedResponseSize =
          networkResponse.headers.get('Content-Length')
        const contentType = networkResponse.headers.get('Content-Type')

        // Save request and response details to browser db
        const requestResponse = {
          url: event.request.url,
          requestBytes: requestSize,
          contentType: contentType || undefined,
          responseBytes: Number(compressedResponseSize || responseSize),
        }

        // Save the request and response to the browser db
        saveNetworkTraffic(requestResponse)

        return networkResponse
      } catch (e) {
        console.log(e)
      }
    })()
  )
}
