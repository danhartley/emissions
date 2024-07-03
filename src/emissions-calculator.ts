export const helloCalculator = () => {
  return 'Hello, calculator!'
}

export { registerServiceWorker } from './register-service-worker'

// TODO:
// create base class
// inherit for node users
// inherit for broswer users

class Calculator {
  constructor(page) {
    console.log(page)
  }
}

export class NodeCalculator extends Calculator {
  constructor(page) {
    super(page)
  }
}

