import { hosting, co2, averageIntensity, marginalIntensity } from "@tgwf/co2"
import { GreenHostingOptions, GreenHostingResponse, Emissions, EmissionsResponse } from './common/types'

export const getEmissions = async ({
    bytes,
    model = '1byte',
    hostingOptions
  }: Emissions
): Promise<EmissionsResponse> => {
  const emissions = new co2(model)

  try {
    const hosting = await hasGreenWebHost(hostingOptions)
    const isGreen = ((hosting as GreenHostingResponse).green || hosting) as boolean
    
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
  hostingOptions: GreenHostingOptions
): Promise<boolean | GreenHostingResponse> => {
  try {
    const { domain } = hostingOptions
    const { options } = hostingOptions
    return await options ? hosting.check(domain, options) : hosting.check(domain)
  } catch (e) {
    console.error('Error checking green status:', e)
    throw e
  }
}

