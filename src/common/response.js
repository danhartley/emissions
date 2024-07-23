export const getResponseDetails = async (response) => {
  const acceptedStatuses = [200, 304]
  const status = response.status()    

  if (!response || !acceptedStatuses.includes(status)) {
    return response
  }

  const url = response.url()

  const buffer = await response.buffer()
  const uncompressedBytes = buffer.length
  const compressedContentLength = response.headers()['content-length']
  const compressedBytes = compressedContentLength
    ? parseInt(compressedContentLength, 10)
    : 0
  const contentType = response.headers()['content-type']
  const encoding = response.headers()['content-encoding'] || 'n/a'
  const resourceType = response.request().resourceType()    

  return {
      url,
      contentType,
      compressedBytes,
      uncompressedBytes,
      encoding,
      resourceType,
  }
}

export const processResponse = async (response, responses) => {
  try {

    const responseDetails = await getResponseDetails(response)

    if(responses.find(e => e.url === responseDetails.url)) return

    responses.push(responseDetails)
  } catch(e) {
    console.log(e)
  }
}
