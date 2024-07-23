import { getBytes, getDomainFromURL, format, parseName } from './utils'

describe('getBytes', () => {
  let bytes
  test('should return compressed byte value when not zero', () => {
    bytes = getBytes({
      compressedBytes: 10,
      uncompressedBytes: 100,
      encoding: '',
    })
    expect(bytes).toBe(10)
  })
  test('should return uncompressed value unchanged when encoding unrecognised', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 100,
      encoding: '',
    })
    expect(bytes).toBe(100)
  })
  test('should return new value when uncompressed encoding recognised as gzip', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 2800,
      encoding: 'gzip',
    })
    expect(bytes).toBe(1000)
  })
  test('should return new value when uncompressed encoding recognised as brotli', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 3000,
      encoding: 'br',
    })
    expect(bytes).toBe(1000)
  })
  test('should return values that relate to compression rate passed in', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 3500,
      encoding: 'br',
      compressionOptions: {
        'br': 4,
        'gzip': 3
      }
    })
    expect(bytes).toBe(1000)
  })
  test('should return values for default compression rates if rates passed in are meaningless', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 3000,
      encoding: 'br',
      compressionOptions: {
        'br': 40,
        'gzippers': 3
      }
    })
    expect(bytes).toBe(1000)
  })
})

describe('Tracker utils functions', () => {
  it('getDomainFromURL should return the domain', () => {
    let url, domain
    url = 'https://ifieldnotes.org/sustainability?qs=qsvalue'
    domain = getDomainFromURL(url)
    expect(domain).toEqual('ifieldnotes.org')
    url = 'https://smth.uk/'
    domain = getDomainFromURL(url)
    expect(domain).toEqual('smth.uk')
    url = 'bbcorp.fr'
    domain = getDomainFromURL(url)
    expect(domain).toEqual('bbcorp.fr')
    url = 'https://www.understood.org/'
    domain = getDomainFromURL(url)
    expect(domain).toEqual('understood.org')
    url = 'https://www.bbc.co.uk'
    domain = getDomainFromURL(url)
    expect(domain).toEqual('bbc.co.uk')
    url = 'http://localhost'
    domain = getDomainFromURL(url)
    expect(domain).toEqual('localhost')
  })

  it('format should return expected outputs', () => {
    let input, output

    input = 0.52555134625578
    output = format({number: input})
    expect(output).toBe('0.53')
    output = format({number: input, maximumFractionDigits: 3})
    expect(output).toBe('0.526')
  })

  it('should return name without qs params', () => {
    let name
    name = 'url?q=1'
    expect(parseName(name)).toBe('url')
    name = ''
    expect(parseName(name)).toBe('')
    name = 'name'
    expect(parseName(name)).toBe('name')
    name = undefined
    expect(parseName(name)).toBe('')
    name = null
    expect(parseName(name)).toBe('')
  })
})

