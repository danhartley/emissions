export const registerServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const s = navigator.serviceWorker
      s.register('./sw.js', {
        updateViaCache: 'all',
      })
      .then((registration: ServiceWorkerRegistration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope)
      })
      .catch((error: Error) => {
        console.log('ServiceWorker registration failed: ', error)
      })
    })
  }
}
