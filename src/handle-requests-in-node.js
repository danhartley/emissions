import { getDomainFromURL, getHostingOptions, pause } from './common/utils.js'
import { processResponse } from './common/response.js'
import { processResponses } from './common/responses.js'
import { getEmissions } from './calculator.js'
import { output } from './common/output.js'

export const getPageEmissions = async (page, url, options) => {
  const ignorable = [
    'Could not load body for this request. This might happen if the request is a preflight request.',
  ]

  let responses = []

  page.on('response', async (response) => {
    try {
      const responseDetails = await processResponse(response)
      responses.push(responseDetails)
    } catch (e) {
      if (!ignorable.includes(e.message)) {
        console.error(e.message)
      }
    }
  })

  await page.goto(url)

  let bytes, groupedByType, groupedByTypeBytes, totalUncachedBytes

  await pause({
    func: async () => {
      ;({ bytes, groupedByType, groupedByTypeBytes, totalUncachedBytes } =
        processResponses(responses))
    },
    delay: 5000,
  })

  const domain = getDomainFromURL(url)

  const { emissions, greenHosting } = await getEmissions({
    bytes,
    hostingOptions: getHostingOptions(options, domain),
  })

  return output({
    url,
    bytes,
    greenHosting,
    responses,
    emissions,
    groupedByType,
    groupedByTypeBytes,
    totalUncachedBytes,
  })
}
