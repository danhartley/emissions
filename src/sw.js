import { fetchHandler } from './handle-requests-in-browser'

try {
  // eslint-disable-next-line no-undef
  self.addEventListener('fetch', fetchHandler)
} catch (e) {
  console.log(
    'The Node.js development environment does not support (browser) service workers.'
  )
  console.log(e)
}
