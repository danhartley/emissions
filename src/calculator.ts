import { hosting, co2, averageIntensity, marginalIntensity } from "@tgwf/co2"

type HostingOptions = {
  domain: string
  options?: {
      verbose: boolean
    , userAgentIdentifier: string
  }
}

type Emissions = {
  bytes: number,
  model?: string,
  hostingOptions?: HostingOptions
}

export const getEmissions = async ({
    bytes,
    model = '1byte',
    hostingOptions
  }: Emissions
): Promise<number> => {
  const emissions = new co2(model)

  try {
    const isHostedGreen = 
      hostingOptions
        ? await getGreen(hostingOptions)
        : false
        
    return emissions.perByte(bytes, isHostedGreen)
  } catch (e) {
    console.error('Error calculating emissions:', e)
    throw e
  }
}

export const getGreen = async (
  hostingOptions: HostingOptions
): Promise<boolean> => {
  try {
    const { domain, options } = hostingOptions
    return await hosting.check(domain, options)
  } catch (e) {
    console.error('Error checking green status:', e)
    throw e
  }
}

