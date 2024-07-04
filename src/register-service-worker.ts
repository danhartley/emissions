export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const s = navigator.serviceWorker
        s.register('./sw.js', {
          updateViaCache: 'all',
        })
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope)
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error)
        })
    })
  }
}
