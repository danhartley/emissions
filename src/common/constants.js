// db constants

export const DB = 'emissionsDB'
export const STORE = 'emissions'
export const entryTypes = [
  'element',
  'event',
  'first-input',
  'largest-contentful-paint',
  'layout-shift',
  'long-animation-frame',
  'longtask',
  'mark',
  'measure',
  'navigation',
  'paint',
  'resource',
  'visibility-state',
]
export const compressionRates = {
  brotli: [
    {
      level: 0,
      rate: 1.2,
    },
    {
      level: 1,
      rate: 2.1,
    },
    {
      level: 2,
      rate: 2.5,
    },
    {
      level: 3,
      rate: 3.0,
    },
    {
      level: 4,
      rate: 3.5,
    },
    {
      level: 5,
      rate: 4.0,
    },
    {
      level: 6,
      rate: 4.3,
    },
    {
      level: 7,
      rate: 4.6,
    },
    {
      level: 8,
      rate: 4.9,
    },
    {
      level: 9,
      rate: 5.0,
    },
    {
      level: 10,
      rate: 5.1,
    },
    {
      level: 11,
      rate: 5.2,
    },
  ],
  gzip: [
    {
      level: 0,
      rate: 1,
    },
    {
      level: 1,
      rate: 1.5,
    },
    {
      level: 2,
      rate: 2.0,
    },
    {
      level: 3,
      rate: 2.3,
    },
    {
      level: 4,
      rate: 2.5,
    },
    {
      level: 5,
      rate: 2.8,
    },
    {
      level: 6,
      rate: 3.0,
    },
    {
      level: 7,
      rate: 3.2,
    },
    {
      level: 8,
      rate: 3.3,
    },
    {
      level: 9,
      rate: 3.4,
    },
  ],
}
