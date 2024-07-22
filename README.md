# Emissions

## Installation 

### Using npm

```
npm install @danhartley/emissions
```

You can use the library in the browser or whilst running e2e tests using puppeteer.

### Node Puppeteer example

In the example below, the URL passed into the getPageEmissions is the URL where your files are served. I use an instance of **http-server** to serve compiled and compressed (brotli and/or gzip) files. This build is comparable to what would served by in produtcion (where the compression might be handled by a CDN such as Netlifly).

In this example, I'm using **http-server** to create an instance of a local server and **Parcel** to simulate production-ready files in a local dist folder.

I'm then using **Puppeteer** to run e2e tests which are checked for emissions.

Steps:
1. Add a server e.g. [Install http-server](https://www.npmjs.com/package/http-server)
2. Use a bundler e.g. and configure compression [Extend Parcel configuration](https://parceljs.org/features/plugins/#extending-configs)
3. Add a script to package.json to instantiate and run the server
4. Create Puppeteer test and set the URL to the build instance served locally at localhost:1234
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
    …
    // -b and -g are for brotli and gzip compression
    "serve": "http-server dist -p 1234 -b -g" 
]
```

```
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