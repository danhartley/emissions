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
  test('should return new value when uncompressed encoding recognised as gzi', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 4970,
      encoding: 'gzip',
    })
    expect(bytes).toBe(1000)
  })
  test('should return new value when uncompressed encoding recognised as gzi', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 5480,
      encoding: 'br',
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

