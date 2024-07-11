import { registerServiceWorker } from './register-service-worker'
import { getNetworkTraffic } from './db/get-network-traffic'
import { getPageEmissions } from './handle-requests-in-node'
import { getEmissions } from './calculator'


export const browser = {
  registerServiceWorker,
  getNetworkTraffic,
  getEmissions
}

export const node = {
  getPageEmissions
}