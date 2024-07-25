import { format } from './utils.js'

export const output = ({url, pageWeight, greenHosting, responses, emissions, groupedByType, groupedByTypeBytes, totalUncachedBytes}) => {
  return {
    url,
    pageWeight,
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