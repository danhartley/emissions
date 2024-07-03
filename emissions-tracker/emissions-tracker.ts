import chalk from 'chalk'
import { hosting, co2, averageIntensity, marginalIntensity } from "@tgwf/co2"
import { getDomainFromURL } from './emissions-tracker-utils.js'

export class EmissionsTracker {
  // Private fields
  #page = null
  #options = {}
  #byteOptions = null
  #visitOptions = null
  #entries = []
  #sameOriginEntries = []
  #thirdPartyEntries = []
  #cumulativeBytes = 0
  #timeToRender = {}    
  #emissionsPerByte = null
  #emissionsPerVisit = null
  #byteTrace = null
  #visitTrace = null
  #hosting = {}
  #perfEntries
  #summary = []
  #details = []

  // Static fields
  static #entryTypes = [
    "element",
    "event",
    "first-input",
    "largest-contentful-paint",
    "layout-shift",
    "long-animation-frame",
    "longtask",
    "mark",
    "measure",
    "navigation",
    "paint",
    "resource",
    "visibility-state" 
  ]

  static #entryTypesProfiled = ['navigation', 'resource']

  // Static methods
  static entryTypes() {
    return EmissionsTracker.#entryTypes
  }

  static entryTypesProfiled() {
    return EmissionsTracker.#entryTypesProfiled
  }

  static parseName(name) {
    const qs = name.indexOf('?')
    return qs > -1 
      ? name.slice(0,qs) // remove querystring parameters
      : name
  }

  static parseDomain(name) {
    const pretty = name.indexOf('/')
    return pretty > -1 
      ? name.slice(0,pretty) // remove pretty parameters
      : name
  }

  static logOut({title, data}) {
    console.log('\n')
    console.warn(title)
    console.table(data)
  }
  
  constructor({page, options, byteOptions, visitOptions}) {

    if (!page) {
        throw new Error('page is required')
    }

    this.#page = page
    this.#options = options
    this.#byteOptions = byteOptions
    this.#visitOptions = visitOptions    

    this.#logResources()
  }

  // Private methods
  #logPerByte({bytes, green = false, bySegment = false}) {
    const co2Emission = bySegment ? new co2({ results: "segment" }) : new co2()
    this.#emissionsPerByte = co2Emission.perByte(bytes, green)
  }

  #logPerVisit({bytes, green = false, bySegment = false}) {
    const co2Emission = bySegment ? new co2({ results: "segment" }) : new co2()
    this.#emissionsPerVisit = co2Emission.perVisit(bytes, green)
  }

  #logPerByteTrace({bytes, green = false, options}) {
    if(bytes) {
      const co2Emission = new co2()
      this.#byteTrace = co2Emission.perByteTrace(bytes, green, options)
    }
  }

  #logPerVisitTrace({bytes, green = false, options}) {
    if(bytes) {
      const co2Emission = new co2()
      this.#visitTrace = co2Emission.perVisitTrace(bytes, green, options)
    }
  }  

  async #checkHosting({domain = '', verbose = true, identifier = ''}) {
    try {
      if(domain.length) {      
        const options = {
          verbose
        , userAgentIdentifier: identifier,
      }

      this.#hosting = await hosting.check(domain, options)
      } else {
        this.#hosting = { hosted_by: 'unknown', green: false }
      }
    } catch (e) {
      this.#hosting = { hosted_by: 'unknown', green: false }
      console.log(e)
    }
  }
  
  async #logPerformanceEntries() {
    this.#perfEntries = JSON.parse(
      await this.#page.evaluate(() => JSON.stringify(performance.getEntries()))
    )
  
    this.#perfEntries.forEach(entry => {
      if(EmissionsTracker.entryTypesProfiled().includes(entry.entryType)) {
          this.#entries.push({
              name: EmissionsTracker.parseName(entry.name)
            , entryType: entry.entryType
            , initiatorType: entry.initiatorType
            , transferSizeInBytes: entry.transferSize
          })
      }
    })

    // Save number of total requests
    this.#summary.push({
        metric: 'Number of requests'
      , value: this.#perfEntries.length
    })

    // Save number of navigation and resource requests
    this.#summary.push({
        metric: 'Number of type navigation or resource requests'
      , value: this.#perfEntries.filter(e => EmissionsTracker.entryTypesProfiled().includes(e.entryType)).length
    })
  }

  async #logResources() {
    if(this.#options.includeThirdPartyResources) {
      const methods = ['GET', 'POST']
      const logTypes = ['image', 'xhr', 'script', 'document', 'stylesheet', 'ping', 'fetch', 'font', 'other']
      const logStatuses = [200]

      const co2Emission = new co2()

      this.#page.on('response', async (response) => {
        
        const url = response.request().url()
        const resourceType = response.request().resourceType()

        // Check resource is one we want to measure
        const isValidMethod = methods.includes(response.request().method())        
        const isValidStatus = logStatuses.length ? logStatuses.includes(response.status()) : true
        const isValidType = logTypes.length ? logTypes.includes(resourceType) : true

        const isValidResource = isValidMethod && isValidType && isValidStatus

        if(!isValidResource) {
          console.log(url)
          return
        }

        const headers = response.headers()

        const isJS = url.includes('.js')
        const isCSS = url.includes('.css')
        // We want to exlude CSS for prefetched pages
        if(isCSS) {
          const age = headers['age']
          if(age) {
            if(Number(age) === 0) return
          } else {
            return
          }        
        }

        let transferSize = 0

        if (headers['content-length']) {
          transferSize = parseInt(headers['content-length'], 10)
        } else {    
          try {
            const buffer = await response.buffer() || null
                    
            if(buffer) {
              transferSize = parseInt(buffer.byteLength, 10)
              // We need to work out the transfer size given the (unzipped) resource size
              if(isCSS) {
                transferSize = transferSize / this.#options.ratios.css
              }
              else if(isJS) {
                transferSize = transferSize / this.#options.ratios.js
              } else {
                transferSize = transferSize / this.#options.ratios.other
              }
            }
          } catch(e) {
            console.log(e)
          }                
        }

        const isSameOrigin = getDomainFromURL({url}) === this.#options.domain

        const target = isSameOrigin
          ? this.#sameOriginEntries
          : this.#thirdPartyEntries

        // Remove duplicates
        if(target.find(t => t.name === EmissionsTracker.parseName(url))) return

        target.push({
            name: EmissionsTracker.parseName(url)
          , entryType: resourceType
          , transferSizeInBytes: transferSize
        })      

        // Calculate cumulative bytes and emissions
        const sobytes = this.#sameOriginEntries.reduce((accumulator, currentValue) => accumulator + currentValue.transferSizeInBytes, 0)
        const tpbytes = this.#thirdPartyEntries.reduce((accumulator, currentValue) => accumulator + currentValue.transferSizeInBytes, 0)
        
        this.#cumulativeBytes = sobytes + tpbytes 
      })

      let recordedBytes = 0

      const logAggregate = ({bytes = 0}) => {        
        if(recordedBytes === bytes) return
        const emissions = co2Emission.perByte(bytes, true)
        EmissionsTracker.logOut({
          title: 'Cumulative bytes in kBs and emissions in mg/CO2. Runs every 5 seconds.'
            , data: [{
                kBs: Number((bytes / 1000).toFixed(1))
              , emissions: Number((emissions * 1000).toFixed(3))
            }]
        })
        recordedBytes = bytes       
      }

      setInterval(() => logAggregate({bytes: this.#cumulativeBytes}), 5000)
    }
  }

  async #printSummary() {

    // Check for green hosting
    try {
      if(this.#options.domain) {
        await this.#checkHosting({ 
            domain: EmissionsTracker.parseDomain(this.#options.domain)
          , identifier: this.#options.domain
        })

        // Save green hosting
        this.#summary.push({
            metric: 'Green hosting'
          , value: this.#hosting.green
        })
        
        if(this.#options?.reportGreenHosting) {
          delete this.#hosting.supporting_documents
          
          const data = {
              title: 'Green reporting'
            , data: this.#hosting
          }

          if(this.#options.verbose) {
            // Log green hosting
            EmissionsTracker.logOut(data)
          }

          // Save green hosting details
          this.#details.push(data)
        }
      }
    } catch(e) {
      console.log(e)
    }

    // Calculate total bytes transferred
    const perfBytes = this.#entries.reduce((accumulator, currentValue) => accumulator + currentValue.transferSizeInBytes, 0)
    const sobytes = this.#sameOriginEntries.reduce((accumulator, currentValue) => accumulator + currentValue.transferSizeInBytes, 0)
    const tpbytes = this.#thirdPartyEntries.reduce((accumulator, currentValue) => accumulator + currentValue.transferSizeInBytes, 0)
    const bytes = sobytes + tpbytes
    const kBs = Number((bytes / 1000).toFixed(1))
    
    // Get country specific grid intensities
    const { data, type, year } = averageIntensity
    const { data: miData, type: miType, year: miYear } = marginalIntensity

    const byteDataBySource = {
        title: 'Comparison of bytes transferred by source'
      , data: [
        {
            source: 'Performance API: third party excluded'
          , bytes: Number((perfBytes / 1000).toFixed(1))
        },
        {
            source: 'Response object: same origin'
          , bytes: Number((sobytes / 1000).toFixed(1))
        },
        {
            source: 'Response object: third party origin'
          , bytes: Number((tpbytes / 1000).toFixed(1))
        },
        {
            source: 'Response object: total'
          , bytes: Number(((sobytes + tpbytes) / 1000).toFixed(1))
        },
      ]
    }

    EmissionsTracker.logOut(byteDataBySource)

    // Calculate grid intensity
    const gridData = {
        title: 'Grid intensity in gCO2e per kWh'
      , data: [{
          countryCode: this.#options.countryCode
        , gridIntensity: data[this.#options.countryCode]
      }]
    }    

    if(this.#options.verbose) {
      // Log grid intensity
      EmissionsTracker.logOut(gridData)
    }

    // Save grid intensity for country code
    this.#details.push(gridData)

    // Save grid intensity
    this.#summary.push({
        metric: 'Grid intensity in gCO2e per kWh'
      , value: gridData.data[0].gridIntensity
    })

    // Calculate total emissions per byte 
    this.#logPerByte({
        bytes
      , green: this.#hosting?.green
      , bySegment: false
    })

    if(this.#options.verbose) {
      // Log per emissions per byte
      EmissionsTracker.logOut({
          title: `Page emissions per byte for ${kBs} kilobytes (Kbs)`
        , data: [{
              unit: 'mg/CO2'
            , emissions: Number((this.#emissionsPerByte * 1000).toFixed(3))
          }]
      })
    }

    // Save emissions per byte in mg
    this.#summary.push({
        metric: 'Page emissions per byte in mg/CO2'
      , value: Number((this.#emissionsPerByte * 1000).toFixed(3))
    })

    // Save emissions per byte in g
    this.#summary.push({
        metric: 'Page emissions per byte in g/CO2'
      , value: Number(this.#emissionsPerByte.toFixed(3))
    })

    // Calculate per emissions per byte per sector
    this.#logPerByte({
        bytes
      , green: this.#hosting?.green
      , bySegment: true
    })

    const perByteData = Object.keys(this.#emissionsPerByte).map(sector => { 
      return {
          sector
        , emissions: Number((this.#emissionsPerByte[sector] * 1000).toFixed(3)) // convert to milligrams
      }
    }) 

    const byteData = {
        title: `Page emissions per byte per segment for ${kBs} kilobytes (kBs)`
      , data: perByteData
    }

    if(this.#options.verbose) {
      // Log emissions per byte per sector
      EmissionsTracker.logOut(byteData)
    }

    // Save emissions per byte per sector
    this.#details.push(byteData)

    // Calculate emissions per visit
    this.#logPerVisit({
        bytes
      , green: this.#hosting?.green
      , bySegment: false
    })

    if(this.#options.verbose) {
      // Log emissions per visit
      EmissionsTracker.logOut({
          title: `Page emissions per visit in mg/CO2 for ${kBs} kilobytes (kBs)`
        , data: [{
              unit: 'mg/CO2'
            , emissions: Number((this.#emissionsPerVisit * 1000).toFixed(3))
          }]
      })
    }
    
    // Save emissions per visit
    this.#summary.push({
        metric: 'Page emissions per visit in mg/CO2'
      , value: Number((this.#emissionsPerVisit * 1000).toFixed(3))
    })

    this.#summary.push({
        metric: 'Page emissions per visit in g/CO2'
      , value: Number((this.#emissionsPerVisit).toFixed(3))
    })

    // Calculate emissions per visit per sector
    this.#logPerVisit({
        bytes
      , green: this.#hosting?.green
      , bySegment: true
    })

    // Log emissions per visit per sector
    const perVisitData = Object.keys(this.#emissionsPerVisit).map(sector => { 
      return {
          sector
        , emissions: Number((this.#emissionsPerVisit[sector] * 1000).toFixed(3)) // convert to milligrams
      }
    }) 

    const visitData = {
        title: `Page emissions per visit per segment for ${kBs} kilobytes (kBs)`
      , data: perVisitData
    }

    if(this.#options.verbose) {
      //Log emissions per visit per sector
      EmissionsTracker.logOut(visitData)
    }

    // Save emissions per visit per sector
    this.#details.push(visitData)

    // Calculate emissions per byte trace
    this.#byteOptions = this.#byteOptions || {
      gridIntensity: {
          device: { country: this.#options.countryCode }
        , dataCenter: { country: this.#options.countryCode }
        , networks: { country: this.#options.countryCode }
      }
    }
    
    this.#logPerByteTrace({
        bytes
      , green: this.#hosting?.green
      , options: this.#byteOptions
    })

    // Log emissions per byte trace
    EmissionsTracker.logOut({
        title: 'Byte trace: grid intensity in g/kWh'
      , data: this.#byteTrace.variables.gridIntensity
    })

    // Calculate emissions per visit trace
    this.#visitOptions = this.#visitOptions || {
        gridIntensity: {
          device: { country: this.#options.countryCode }
        , dataCenter: { country: this.#options.countryCode }
        , networks: { country: this.#options.countryCode }
      }
    }
        
    this.#logPerVisitTrace({
        bytes
      , green: this.#hosting?.green
      , options: this.#visitOptions
    })

    // Log emissions per visit trace
    EmissionsTracker.logOut({
        title: 'Visit trace: grid intensity in g/kWh'
      , data: this.#visitTrace.variables.gridIntensity
    })
  

    // Save total bytes transferred
    this.#summary.push({
        metric: 'Resources transferred in kBs'
      , value: kBs
    })

    // Calculate time to fetch data
    if(this.#options.markStart?.length && this.#options.markEnd?.length) {
        performance.mark(this.#options.markStart)?.startTime || 0
        performance.mark(this.#options.markEnd)?.startTime || 0

        this.#timeToRender = performance.measure(
          'time-to-render',
          this.#options.markStart,
          this.#options.markEnd
        )

        // Save time to fetch
        this.#summary.push({
            metric: 'Time to fetch data in seconds'
          , value: Number(this.#timeToRender.duration.toFixed(3))
        })
    }

    // Calculate page timings from page
    const pageTiming = this.#perfEntries.find(e => e.entryType === 'navigation')
    
    if(pageTiming) {
      const pageTimingName = pageTiming.name
      const pageDOMContentLoadedEventEnd = pageTiming.domContentLoadedEventEnd 
      const pageTimingDuration = pageTiming.duration
  
      // Save page timings
      this.#summary.push({
          metric: 'Website name'
        , value: pageTimingName
      })

      this.#summary.push({
          metric: 'DOMContentLoaded in ms'
        , value: Math.round(pageDOMContentLoadedEventEnd)
      })

      this.#summary.push({
          metric: 'Load: duration in ms'
        , value: Math.round(pageTimingDuration)
      })
    } else {
      console.log('\n')
      console.log('** Please check the website address you supplied as an argument. **')
    }
    
    if(this.#options.verbose) {
      // Print bytes per request from performance entities
      let data = this.#options?.sort?.sortBy
        ? this.#options.sort.sortBy({
              arr: this.#entries.filter(e => e.transferSizeInBytes > 0)
            , prop: 'transferSizeInBytes'
            , dir: this.#options.sort.direction
        }) 
        : this.#entries

      EmissionsTracker.logOut({
          title: 'Performance API: transfer size by entry'
        , data
      })

      // Print bytes per request from response
      data = this.#options?.sort?.sortBy
        ? this.#options.sort.sortBy({
              arr: this.#sameOriginEntries
            , prop: 'transferSizeInBytes'
            , dir: this.#options.sort.direction
        }) 
        : this.#entries

      EmissionsTracker.logOut({
          title: 'Response object: transfer size for same origin requests'
        , data
      })

      // Print bytes per request from response
      data = this.#options?.sort?.sortBy
        ? this.#options.sort.sortBy({
              arr: this.#thirdPartyEntries
            , prop: 'transferSizeInBytes'
            , dir: this.#options.sort.direction
        }) 
        : this.#entries

      EmissionsTracker.logOut({
          title: 'Response object: transfer size for third party requests'
        , data
      })
    }

    if(this.#options.lighthouse.log) {      
      this.#summary.push({
          metric: 'Lighthouse total resource transfer size in kBs'
        , value: Number((this.#options.lighthouse.summary.totalResourceTransferSize / 1000).toFixed(1))
      })
      
      this.#summary.push({
          metric: 'Lighthouse byte weight in kBs'
        , value: Number((this.#options.lighthouse.summary.totalByteWeight / 1000).toFixed(1))
      })
      
      this.#summary.push({
          metric: 'Lighthouse request count'
        , value: this.#options.lighthouse.summary.requestCount
      })
      
      this.#summary.push({
          metric: 'Lighthouse observed load'
        , value: this.#options.lighthouse.summary.observedLoad
      })
      
      this.#summary.push({
          metric: 'Lighthouse observed DOM content loaded'
        , value: this.#options.lighthouse.summary.observedDomContentLoaded
      })

      this.#summary.push({
          metric: 'Lighthouse DOM count'
        , value: this.#options.lighthouse.summary.DOMSize
      })
    }

    // Print summary
    EmissionsTracker.logOut({
        title: 'Page summary'
      , data: this.#summary
    })
  }

  async #printLighthouseSummary() {
    if(this.#options.lighthouse.log)
      EmissionsTracker.logOut({
        title: 'Lighthouse summary report'
      , data: [
        {
            DOMSize: this.#options.lighthouse.summary.DOMSize
          , observedLoad: this.#options.lighthouse.summary.observedLoad
          , observedDomContentLoaded: this.#options.lighthouse.summary.observedDomContentLoaded
          , totalThirdPartyResourceTransferSize: Number((this.#options.lighthouse.summary.thirdPartySummary.totalTransferSize / 1000).toFixed(1))
          , totalResourceTransferSize: Number((this.#options.lighthouse.summary.totalResourceTransferSize / 1000).toFixed(1))
          , requestCount: this.#options.lighthouse.summary.requestCount
          , totalByteWeight: Number((this.#options.lighthouse.summary.totalByteWeight / 1000).toFixed(1))
        },
      ]
    })
  }

  // Public methods
  async getReport() {
    await this.#logPerformanceEntries()
    await this.#printSummary()
    await this.#printLighthouseSummary()
    return {
        summary: this.#summary
      , details: this.#details
    }
  }
}

export const helloTracker = () => {
  return 'Hello, tracker, how are you?'
}