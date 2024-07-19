import { getDomainFromURL, format, getHostingOptions, pause } from './common/utils.js'
import { processResponse } from './common/process-response.js'
import { processResponses } from './common/process-responses.js'
import { getEmissions } from './calculator.js'

export const getPageEmissions = async (page, url, options) => {
  const ignorable = [
    'Could not load body for this request. This might happen if the request is a preflight request.',
  ]

  let responses = []
  
  page.on('response', async (response) => {
    try {
      await processResponse(response, responses)
    } catch (e) {
      if (!ignorable.includes(e.message)) {
        console.log(response.url())
        console.error(e.message)
      }
    }
  })

  await page.goto(url)

  let totalBytes, groupedByType, groupedByTypeBytes, totalUncachedBytes

  await pause({
    func: async () => {
      ({ totalBytes, groupedByType, groupedByTypeBytes, totalUncachedBytes } = processResponses(responses))

    }, delay: 5000
  })  

  const domain = getDomainFromURL(url)
    
  const { emissions, greenHosting } = await getEmissions({
    bytes: totalBytes,
    hostingOptions: getHostingOptions(options, domain),
  })

  return {
    url,
    domain,
    pageWeight: totalBytes,
    greenHosting,
    count: responses.length,
    emissions,
    mgCO2: format({ number: emissions }),
    data: {
      groupedByType,
      groupedByTypeBytes,
      totalUncachedBytes,
    },
    responses
  }
}
