import { saveNetworkTraffic } from './db/browser'

try {  
  self.addEventListener('fetch', (event: FetchEvent) => {        
    event.respondWith(
      (async () => {
        console.log('event: ', event)
        // Request details
        const requestClone: Request = event.request.clone()
        const requestBody: string = await requestClone.text()
        const requestSize: number = new TextEncoder().encode(requestBody).length
        console.log('requestClone: ', requestClone)
        const networkResponse: Response = await fetch(event.request)
        const clonedResponse: Response = networkResponse.clone()

        // Response details
        const responseBody: string = await clonedResponse.text()
        const responseSize: number = new TextEncoder().encode(responseBody).length
        const compressedResponseSize: string | null = networkResponse.headers.get('Content-Length')
        const contentType: string | null = networkResponse.headers.get('Content-Type')

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
