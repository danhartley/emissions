import { hosting, co2 } from '@tgwf/co2'
// import { hosting, co2, averageIntensity, marginalIntensity } from "@tgwf/co2"

export const getEmissions = async ({
  bytes,
  model = '1byte',
  hostingOptions,
}) => {
  const emissions = new co2(model)

  try {
    const forceGreen = hostingOptions?.options?.forceGreen === true
    const webHosting = forceGreen || await hasGreenWebHost(hostingOptions)
    const greenHosting = webHosting.url ? webHosting.green : webHosting
    
    return {
      emissions: emissions.perByte(bytes, greenHosting),
      greenHosting,
    }
  } catch (e) {
    console.error('Error calculating emissions:', e)
    throw e
  }
}

export const hasGreenWebHost = async (hostingOptions) => {
  try {
    const { domain } = hostingOptions
    const { options } = hostingOptions
    return (await options)
      ? hosting.check(domain, options)
      : hosting.check(domain)
  } catch (e) {
    console.error('Error checking green status:', e)
    throw e
  }
}
