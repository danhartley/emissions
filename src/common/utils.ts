export const isNode = (): boolean => {
  return !(window && typeof window !== 'undefined' && typeof document !== 'undefined')
}

export const isBrowser = (): boolean => {
  return window && typeof window !== 'undefined' && typeof document !== 'undefined'
}