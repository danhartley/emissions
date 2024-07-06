export type RequestResponse = {
  url: string
  requestBytes: number
  contentType?: string
  responseBytes: number
}

export type NetworkTraffic = {
  responses: [{
    url: string
    requestBytes: number
    contentType?: string
    responseBytes: number
  }]
  emissions?: number,
  isGreen?: boolean
}

export type GreenHostingOptions = {
  domain: string
  options?: {
      verbose: boolean
    , userAgentIdentifier: string
  }
}

export type GreenHostingResponse = {
  url: string
  hosted_by: string
  hosted_by_website: string
  partner?: string
  green: boolean
  hosted_by_id: number
  modified: string
  supporting_documents: [{
    id: number
    title: string
    link: string
  }]
}

export type Emissions = {
  bytes: number,
  model?: string,
  hostingOptions?: GreenHostingOptions
}

export type EmissionsResponse = {
  emissions: number,
  isGreen: boolean
}

