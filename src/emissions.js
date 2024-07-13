import { registerServiceWorker } from './register-service-worker'
import { getNetworkTraffic } from './db/get-network-traffic'
import { getPageEmissions } from './handle-requests-in-node'

export const browser = {
  registerServiceWorker,
  getPageEmissions: getNetworkTraffic,
}

export const node = {
  getPageEmissions,
}
