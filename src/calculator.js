// @ts-nocheck
import { hosting, co2, averageIntensity, marginalIntensity } from "@tgwf/co2"

export const getEmissions = async ({
    bytes,
    model = '1byte',
    hostingOptions
  }
) => {
  const emissions = new co2(model)

  try {
    const hosting = await hasGreenWebHost(hostingOptions)
    const isGreen = (hosting.green || hosting)
    
    return {
      emissions: emissions.perByte(bytes, isGreen),
      isGreen
    }
  } catch (e) {
    console.error('Error calculating emissions:', e)
    throw e
  }
}

export const hasGreenWebHost = async (
  hostingOptions
) => {
  try {
    const { domain } = hostingOptions
    const { options } = hostingOptions
    return await options ? hosting.check(domain, options) : hosting.check(domain)
  } catch (e) {
    console.error('Error checking green status:', e)
    throw e
  }
}

