self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
      })
  )
})


// self.addEventListener('fetch', (event: FetchEvent) => {
//   event.respondWith(
//     caches.match(event.request)
//       .then((response: Response | undefined) => {
//         return response || fetch(event.request)
//       })
//   )
// })
