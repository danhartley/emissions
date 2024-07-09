export const pause = async ({func, delay = 2000}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(func())
    }, delay)
  })
}

export const sortBy = ({arr, prop, dir = 'asc'}) => {
  return dir === 'asc' 
   ? arr.sort((a, b) => {
        const x = a[prop]
        const y = b[prop]
        return x - y
      })
    : arr.sort((a, b) => {
        const x = a[prop]
        const y = b[prop]
        return y - x
      })
}