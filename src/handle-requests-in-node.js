import { getDomainFromURL, format } from './common/utils.js'
import { processResponse } from './common/process-response.js'
import { processResponses } from './common/process-responses.js'
import { getEmissions } from './calculator.js'

export const getPageEmissions = async (page, url, hostingOptions) => {
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

  const { totalBytes, groupedByType, groupedByTypeBytes, totalUncachedBytes } = processResponses(responses)

  const domain = hostingOptions?.domain || getDomainFromURL(url)

  const { emissions, greenHosting } = await getEmissions({
    bytes: totalBytes,
    hostingOptions: { ...hostingOptions, domain },
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
