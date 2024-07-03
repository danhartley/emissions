export const helloCalculator = () => {
  return 'Hello, calculator!'
}

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

