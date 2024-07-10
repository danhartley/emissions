/* eslint-disable no-undef */
import { fetchHandler } from './handle-requests-in-browser'

try {
  self.addEventListener('fetch', fetchHandler)
} catch (e) {
  console.log('The Node.js development environment does not support (browser) service workers.')
}
