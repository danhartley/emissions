// @ts-nocheck
import { saveNetworkTraffic } from './db/browser'

try {  
  self.addEventListener('fetch', event => {        
    event.respondWith(
      (async () => {
        console.log('event: ', event)
        // Request details
        const requestClone = event.request.clone()
        const requestBody = await requestClone.text()
        const requestSize = new TextEncoder().encode(requestBody).length
        console.log('requestClone: ', requestClone)
        const networkResponse = await fetch(event.request)
        const clonedResponse = networkResponse.clone()

        // Response details
        const responseBody = await clonedResponse.text()
        const responseSize = new TextEncoder().encode(responseBody).length
        const compressedResponseSize = networkResponse.headers.get('Content-Length')
        const contentType = networkResponse.headers.get('Content-Type')

        // Save request and response details to browser db
        const requestResponse = {
          url: event.request.url,
          requestBytes: requestSize,
          contentType: contentType || undefined,
          responseBytes: Number(compressedResponseSize || responseSize)
        }
        await saveNetworkTraffic(requestResponse)

        return networkResponse
      })()
    )
  })
} catch (e) {
  console.log('The Node.js development environment does not support (browser) service workers.')
}
