import { format } from './utils.js'

export const output = ({url, bytes, greenHosting, responses, emissions, groupedByType, groupedByTypeBytes, totalUncachedBytes}) => {
  return {
    url,
    bytes,
    count: responses.length,
    greenHosting,
    emissions,
    mgCO2: format({ number: emissions }),
    data: {
      groupedByType, 
      groupedByTypeBytes, 
      totalUncachedBytes
    }
  }
}