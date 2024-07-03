export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // navigator.serviceWorker.register('./sw.js')
        const s = navigator.serviceWorker
        s.register('./sw.js', {
          updateViaCache: 'all', // dev mode only (nb use process)
        }) // hack to get around the error "Registering service workers with a string literal is not supported."
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope)
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error)
        })
    })
  }
}
