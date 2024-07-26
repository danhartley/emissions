# Emissions

## Installation

### Using npm

```
npm install @danhartley/emissions
```

This library can be used in the browser or in a node environment running, for example, an e2e test.

### Simple Puppeteer example

This example takes a URL as an argument on the command line and returns an emissions report. A lighthouse report is optional.

Please see the complete example at: [E2E tests with emissions](https://github.com/danhartley/emissions-js-node-test)

### Puppeteer example with Parcel

In the example below, the URL passed into the getPageEmissions is the URL where your files are served. I use an instance of **http-server** to serve compiled and compressed (brotli and/or gzip) files. This build is comparable to what would be served in production (where the compression might be handled by a CDN such as Netlifly).

In this example, I'm using **http-server** to serve files from a local dist folder and **Parcel** to simulate a production environment.

The e2e test is controlled by **Puppeteer** and gives me the opportunity to check emissions generated when requesting a page.

Configuration:

- Import the necessary library: [ http-server](https://www.npmjs.com/package/http-server)
- Configure compression for your bundeler, in my case for Parcel - [Extend Parcel configuration](https://parceljs.org/features/plugins/#extending-configs)
- Add a build script to package.json to create a pseudo production build
- Add a serve script to package.json to instantiate and run the server
- Create a [Puppeteer](https://pptr.dev/) test and set its URL to the build instance served locally at localhost:1234

```

// Command line
npm install --global http-server

//.parcelrc
{
  "extends": "@parcel/config-default",
  "compressors": {
    "*.{html,css,js,svg,map}": [
      "...",
      "@parcel/compressor-gzip",
      "@parcel/compressor-brotli"
    ]
  }
}

// package.json
"scripts": [
    "build": "parcel build" // build to dist
    // -b and -g are for brotli and gzip compression
    // serve files from dist on localhost port 1234
    "serve": "http-server dist -p 1234 -b -g"
]
```

```
// e2e.test
import puppeteer from 'puppeteer'

import { node } from '@danhartley/emissions'

;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  })

  const page = await browser.newPage()

  await page.setViewport({
    width: 1920,
    height: 1080
  })

  const url = 'localhost:1234' // this matches the local port where we are serving files from the dist folder
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
  } = await node.getPageEmissions(page, url, options)

  // log your emissions here

  await browser.close()
})()

```

Running the test:

- Build a version of the app comparable to production
- Start the local server
- Run the e2e2 test
- Log the emissions associated with the test

```
// terminal instance
npm run build
// terminal instance
npm run serve
// terminal instance
node ./e2e.test

```

### Browser example
