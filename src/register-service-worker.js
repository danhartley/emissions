export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    // eslint-disable-next-line no-undef
    window.addEventListener('load', () => {
      const serviceWorker = navigator.serviceWorker
      serviceWorker
        .register('./sw.js')
        .then((registration) => {
          console.log(
            'ServiceWorker registration successful with scope: ',
            registration.scope
          )
          return serviceWorker
        })
        .catch((error) => {
          console.log('ServiceWorker registration failed: ', error)
        })
    })
  }
}
