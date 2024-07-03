import puppeteer from 'puppeteer'

import { sortBy, pause } from './test-utils.js'
import { parseCLIArguments, getLighthouseReport } from './emissions-tracker-utils.js'
import { EmissionsTracker } from './emissions-tracker.js'

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const testSite = async ({byteOptions = null, visitOptions = null}) => {

  let emissionsTracker, report, summary

  const { url, domain, verbose, lighthouse, ratios } = parseCLIArguments({ args: process.argv })

  if(lighthouse) {
    const lhReport = await getLighthouseReport({
        lighthouse
      , chromeLauncher
      , url
    })

    report = lhReport.report
    summary = lhReport.summary
  }

  // Launch the browser in headless mode with support for Chrome DevTools
  // The viewport default is overridden so that we can scroll to the bottom of the page
  const browser = await puppeteer.launch({
        headless: false
      , devtools: true
      , defaultViewport: null
  })

  // Create a page
  const page = await browser.newPage()

  try {
      // Create instance of emissions tracker 
      emissionsTracker = new EmissionsTracker({
        page
      , options: {
            domain
          , reportGreenHosting: true
          , countryCode: 'PRT'
          , includeThirdPartyResources: true
          , sort: {
              sortBy
            , direction: 'desc'
          }
          , verbose
          , lighthouse: { log: lighthouse, report, summary }    
          , ratios
        }
        , byteOptions
        , visitOptions
      })

      // Navigate to site
      await page.goto(url)
      
      // Scrolling to the bottom of the page
      await page.evaluate(() => {
        window.scrollTo({
            top: document.body.scrollHeight
          , behavior: 'smooth'
        })
      })

      // Get performance report
      await pause({
        func: async () => {
          const { summary, details } = await emissionsTracker.getReport()
        }
      }, 0)
  } catch(e) {
    console.log(`
      Please check the names and values of your node flags. 
      \n
      These are your options:
      -u or --url { url value } 
      -v or --verbose { verbose boolean }
      -lh or --lighthouse { lighthouse boolean } 
      \n
      e.g. node emissions-by-url.js -u https://www.theguardian.com/uk -v -lh
    `)
    console.log(e)
    process.exit(1)
  } finally {
    // await browser.close()
  }
}

testSite({})