import { hosting, co2, averageIntensity, marginalIntensity } from "@tgwf/co2"
import { processResponse } from './common/process-response.js'
import { processResponses } from './common/process-responses.js'

export class EmissionsTracker {
  // Private fields
  #page = null
  #options = {}
  #byteOptions = null
  #visitOptions = null
  #entries = []
  #cumulativeBytes = 0
  #emissionsPerByte = null
  #emissionsPerVisit = null
  #byteTrace = null
  #visitTrace = null
  #hosting = {}
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
  
  constructor({page, options, byteOptions = null, visitOptions = null}) {

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

  async #logResources() {
    const co2Emission = new co2()

    this.#page.on('response', async(response) => {
      await processResponse(response, this.#entries)

      const url = this.#entries[0].url

      // Remove duplicates
      if(this.#entries.find(t => t.name === EmissionsTracker.parseName(url))) return

      // Calculate cumulative bytes and emissions
      this.#cumulativeBytes = this.#entries.reduce((accumulator, currentValue) => accumulator + currentValue.compressedBytes, 0)  
    })

    const { totalBytes, groupedByType, groupedByTypeBytes, totalUncachedBytes } = processResponses(responses)

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
    const bytes = this.#entries.reduce((accumulator, currentValue) => accumulator + currentValue.compressedBytes, 0)
    const kBs = Number((bytes / 1000).toFixed(1))
    
    // Get country specific grid intensities
    const { data, type, year } = averageIntensity
    const { data: miData, type: miType, year: miYear } = marginalIntensity

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
    // EmissionsTracker.logOut({
    //     title: 'Byte trace: grid intensity in g/kWh'
    //   , data: this.#byteTrace.variables.gridIntensity
    // })

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
    // EmissionsTracker.logOut({
    //     title: 'Visit trace: grid intensity in g/kWh'
    //   , data: this.#visitTrace.variables.gridIntensity
    // })

    // Save total bytes transferred
    this.#summary.push({
        metric: 'Resources transferred in kBs'
      , value: kBs
    })

    this.#summary.push({
        metric: 'Number of requests'
      , value: this.#entries.length
    })

    // if(this.#options.lighthouse.log) {      
    //   this.#summary.push({
    //       metric: 'Lighthouse total resource transfer size in kBs'
    //     , value: Number((this.#options.lighthouse.summary.totalResourceTransferSize / 1000).toFixed(1))
    //   })
      
    //   this.#summary.push({
    //       metric: 'Lighthouse byte weight in kBs'
    //     , value: Number((this.#options.lighthouse.summary.totalByteWeight / 1000).toFixed(1))
    //   })
      
    //   this.#summary.push({
    //       metric: 'Lighthouse request count'
    //     , value: this.#options.lighthouse.summary.requestCount
    //   })
      
    //   this.#summary.push({
    //       metric: 'Lighthouse observed load'
    //     , value: this.#options.lighthouse.summary.observedLoad
    //   })
      
    //   this.#summary.push({
    //       metric: 'Lighthouse observed DOM content loaded'
    //     , value: this.#options.lighthouse.summary.observedDomContentLoaded
    //   })

    //   this.#summary.push({
    //       metric: 'Lighthouse DOM count'
    //     , value: this.#options.lighthouse.summary.DOMSize
    //   })
    // }

    // Print summary
    EmissionsTracker.logOut({
        title: 'Page summary'
      , data: this.#summary
    })
  }

  // async #printLighthouseSummary() {
  //   if(this.#options.lighthouse.log)
  //     EmissionsTracker.logOut({
  //       title: 'Lighthouse summary report'
  //     , data: [
  //       {
  //           DOMSize: this.#options.lighthouse.summary.DOMSize
  //         , observedLoad: this.#options.lighthouse.summary.observedLoad
  //         , observedDomContentLoaded: this.#options.lighthouse.summary.observedDomContentLoaded
  //         , totalThirdPartyResourceTransferSize: Number((this.#options.lighthouse.summary.thirdPartySummary.totalTransferSize / 1000).toFixed(1))
  //         , totalResourceTransferSize: Number((this.#options.lighthouse.summary.totalResourceTransferSize / 1000).toFixed(1))
  //         , requestCount: this.#options.lighthouse.summary.requestCount
  //         , totalByteWeight: Number((this.#options.lighthouse.summary.totalByteWeight / 1000).toFixed(1))
  //       },
  //     ]
  //   })
  // }

  // Public methods
  async getReport() {
    await this.#printSummary()
    // await this.#printLighthouseSummary()
    const results = {
        summary: this.#summary
      , details: this.#details
    }

    this.#summary = []
    this.#details = []

    return results
  }
}

