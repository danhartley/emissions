# Emissions

## Installation 

### Using npm

```
npm install @danhartley/emissions
```

You can use the library in the browser or whilst running e2e tests using puppeteer.

### Node Puppeteer example

```
import puppeteer from 'puppeteer'

import { node } from '@danhartley/emissions'

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
  })

  const page = await browser.newPage()
  page.setCacheEnabled(false)

  const url = {your url goes here e.g. http://localhost:3000}
  const options = {
    hostingOptions: {
      verbose: false,
      forceGreen: true,
    },
  }

  const {
    pageWeight,
    count,
    emissions,
    greenHosting,
    data,
    domain,
    responses,
  } = await node.getPageEmissions(page, url, options)
  
  // log your emissions here
  
  await browser.close()
})()

```