import { getBytes } from './utils'

describe('getBytes', () => {
  let bytes
  test('should return compressed byte value when not zero', () => {
    bytes = getBytes({
      compressedBytes: 10,
      uncompressedBytes: 100,
      encoding: ''
    })
    expect(bytes).toBe(10)
  })
  test('should return uncompressed value unchanged when encoding unrecognised', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 100,
      encoding: ''
    })
    expect(bytes).toBe(100)
  })
  test('should return new value when uncompressed encoding recognised as gzi', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 4970,
      encoding: 'gzip'
    })
    expect(bytes).toBe(1000)
  })
  test('should return new value when uncompressed encoding recognised as gzi', () => {
    bytes = getBytes({
      compressedBytes: 0,
      uncompressedBytes: 5480,
      encoding: 'br'
    })
    expect(bytes).toBe(1000)
  })
})