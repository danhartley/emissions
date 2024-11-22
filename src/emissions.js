import { registerServiceWorker } from './register-service-worker'
import { getNetworkTraffic } from './db/get-network-traffic'
import { clearNetworkTraffic } from './db/clear-network-traffic'
import { getPageEmissions } from './handle-requests-in-node'
import { getEmissions } from './calculator'

export const browser = {
  registerServiceWorker,
  getPageEmissions: getNetworkTraffic,
  clearPageEmissions: clearNetworkTraffic,
}

export const node = {
  getPageEmissions,
  getEmissions,
}
