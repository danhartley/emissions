
# Emissions tracker

Monitor the carbon emissions of websites and web apps. 

An end-to-end test using the emissions tracker has 3 external dependencies:
- [@tgwf/co2](https://github.com/thegreenwebfoundation/co2.js/)
- [puppeteer](https://github.com/puppeteer/puppeteer)
- [lighthouse](https://github.com/GoogleChrome/lighthouse)

```
npm install @tgwf/co2
npm i puppeteer
npm i lighthouse
```

The tracker scrolls to the bottom of the page. This can have a dramatic effect on page weight, emissions, etc.

## Integration tests

Create a new integration test with puppeteer. Create a new instance of the EmissionsTracker and call its public method, getReport.

If you want to include lighthouse values in your report, include lighthouse

```
import puppeteer from 'puppeteer'
import lighthouse from 'lighthouse'
import { EmissionsTracker } from './emissions-tracker.js'

const testSite = async () => {

    // Launch the browser
    const browser = await puppeteer.launch({
        headless: false
      , devtools: true
      , defaultViewport: null
    })

    // Create a page
    const page = await browser.newPage()

    // Specify options
    const options = {
      // e.g. country code for grid intensity (see working example)
    }}

    // Create a new instance of the emissions tracker
    const emissionsTracker = new EmissionsTracker({ page, options })
    
    // Navigate to site
    await page.goto('https://www.example.com/')

    // Many pages continue to load as the user scrolls down.
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // Run the report
    const { summary, details } = await emissionsTracker.getReport()

    // Do something with the report summary and details…
```

## Flags

- -v or --verbose
- -u or --url
- -lh or --lighthouse\
- -r or --ratios for compression ratios

### Example

```
node emissions-tracker/emissions-by-url.js -u the-public-good.com -v -lh -r 1,2,3
```

## References

[Estimating Digital Emissions | Sustainable Web Design](https://sustainablewebdesign.org/estimating-digital-emissions/)

[Web Performance Recipes With Puppeteer | Addy Osmani
](https://addyosmani.com/blog/puppeteer-recipes/)

### Query for a single domain

```
curl -X 'GET' \
'https://api.thegreenwebfoundation.org/api/v3/greencheck/bbc.co.uk' \
-H 'accept: application/json'
```

## Installation

```sh
npm install @danhartley/emissions
