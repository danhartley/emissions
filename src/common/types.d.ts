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

export type ResponseDetails = {
  url: string
  status: number
  type?: string
  compressedBytes: number
  uncompressedBytes: number
  encoding?: string
  fromCache: boolean
  resourceType?: string
  bytes?: number
}

export type GroupedByType = {
  [key: string]: ResponseDetails[]
}

export type GroupBytes = {
  type: string
  bytes: number
  uncachedBytes: number
  count: number
}

export type RunChecksResponse = {
  totalBytes: number
  count: number
  emissions: number
  isGreen: boolean
  data?: {}
}