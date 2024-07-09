const getDomainByPatternMatching = ({url}) => {
  let result
  let match
  if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
      result = match[1]
      if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
          result = match[1]
      }
  }
  return result
}

export const getDomainFromURL = ({url}) => {
  try {
    const parsedURL = new URL(url)
    let hostname = parsedURL.hostname

    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    return hostname }
  catch (e) {
    // If the built in parser fails, as it will for e.g. bbcorp.fr, use pattern matching
    return getDomainByPatternMatching({url})
  }
}

export const getLighthouseReport = async ({lighthouse, chromeLauncher, url}) => {    
    const chrome = await chromeLauncher.launch({
      chromeFlags: [ 
          '--headless'
      ]
    })
    const options = {logLevel: 'info', output: 'html', onlyCategories: ['performance'], port: chrome.port}
    const runnerResult = await lighthouse(url, options)
    const lh = runnerResult.lhr
    
    const report = {
      'audits': { 
        'first-contentful-paint': {
            id: lh.audits['first-contentful-paint'].id
          , title: lh.audits['first-contentful-paint'].title
          , score: lh.audits['first-contentful-paint'].score
        },
        'largest-contentful-pain': {
            id: lh.audits['largest-contentful-paint'].id
          , title: lh.audits['largest-contentful-paint'].title
          , score: lh.audits['largest-contentful-paint'].score
        },
        'first-meaningful-paint': {
            id: lh.audits['first-meaningful-paint'].id
          , title: lh.audits['first-meaningful-paint'].title
          , score: lh.audits['first-meaningful-paint'].score
        },
        'speed-index': {
            id: lh.audits['speed-index'].id
          , title: lh.audits['speed-index'].title
          , score: lh.audits['speed-index'].score
        },
        'interactive': {
            id: lh.audits['interactive'].id
          , title: lh.audits['interactive'].title
          , score: lh.audits['interactive'].score
        },
        'user-timings': {
            id: lh.audits['user-timings'].details.items
        },
        'metrics': lh.audits['metrics'].details.items,      
        'resource-summary': lh.audits['resource-summary'].details.items,
        'third-party-summary': lh.audits['third-party-summary'].details.items,      
        'script-treemap-data': lh.audits['script-treemap-data'].details.items,      
        'total-byte-weight': lh.audits['total-byte-weight'].details.items,
        'dom-size': lh.audits['dom-size'].numericValue,      
      },
      'entities': lh.entities
    }

    const summary = {
          totalResourceTransferSize: report.audits['resource-summary'].find(r => r.resourceType === "total").transferSize
        , requestCount: report.audits['resource-summary'].find(r => r.resourceType === "total").requestCount
        , resources: report.audits['resource-summary'].filter(r => r.resourceType !== "total")
        , observedDomContentLoaded: report.audits.metrics[0]?.observedDomContentLoaded || 0
        , observedLoad: report.audits.metrics[0].observedLoad || 0
        , thirdPartySummary: {
            totalTransferSize: report.audits['third-party-summary'].reduce((total, tp) => total + tp.transferSize, 0)
          , entities: report.audits['third-party-summary'].map(tp => { return { entity: tp.entity, transferSize: tp.transferSize }})
        }
        , totalByteWeight: report.audits['total-byte-weight'].reduce((total, current) => total + current.totalBytes,0)
        , DOMSize: report.audits['dom-size']
    }
    
    chrome.kill()
    
    return { report, summary }
}

export const parseCLIArguments = ({args}) => {
  
  const verboseArgs = ['-v', '--verbose']
  const urlArgs = ['-u', '--url']
  const lighthouseArgs = ['-lh', '--lighthouse']
  const ratioArgs = ['-r', '--ratios']

  let url, domain, verbose = false, lighthouse = false, ratios = {
      css: 6
    , js: 2
    , other: 5
  }

  const argLength = args.length
  
  for (let i = 0; i < argLength; i++) {
      const val = args[i]
      const nextArg = i + 1 < argLength ? args[i + 1] : null

      if (verboseArgs.includes(val)) {
          verbose = true
      }

      if(lighthouseArgs.includes(val)) {
        lighthouse = true
      }
      
      if (nextArg) {
          if (urlArgs.includes(val)) {
              url = nextArg.includes('http') ? nextArg : `https://${nextArg}`
              domain = getDomainFromURL({ url })
          } 
          if (ratioArgs.includes(val)) {
              const [css, js, other] = nextArg.split(',')
              ratios = {
                css: Number(css) || ratios.css,
                js: Number(js) || ratios.js,
                other: Number(other) || ratios.other
            }
          }
      }
  }

  return { url, domain, verbose, lighthouse, ratios }
}
