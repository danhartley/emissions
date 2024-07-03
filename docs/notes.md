### Notes for personal reference only

**scope:** scope with ```npm init --scope=@danhartley```
**package:** make available locally using ```npm link``` and ```npm link @danhartley/emissions```
**npm test**: set experimental flag for in test script for [jest support ES modules](https://jestjs.io/docs/ecmascript-modules) - not necessary after converted to a ts project  
**package.json**: set ```module:true``` for ES module support  
**mode:** once project converted to ts from js, not required to set module true in package.json
**typescript:** convert existing code to typescript  
**console in node** command line [tips](https://nodejs.org/en/learn/command-line/output-to-the-command-line-using-nodejs) and colour with [chalk](https://github.com/chalk/chalk)
**scoped error handling** [mdn try…catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
**list local packages** ```npm ls```
**delete local package** ```sudo npm rm {package}```

```
try {
  myroutine(); // may throw three types of exceptions
} catch (e) {
  if (e instanceof TypeError) {
    // statements to handle TypeError exceptions
  } else if (e instanceof RangeError) {
    // statements to handle RangeError exceptions
  } else if (e instanceof EvalError) {
    // statements to handle EvalError exceptions
  } else {
    // statements to handle any unspecified exceptions
    logMyErrors(e); // pass exception object to error handler
  }
}
```

**npm link** run in the dist folder with its own package.json (this is the package that is released)
**main** config item is for commonJS 
**module** config item is for ES modules
**sideEffects** allows for bundlers to perform tree shaking
**dependenct update** https://www.thegreenwebfoundation.org/news/release-guide-co2-js-v0-16/
**remove node_modules** ```rm -rf node_modules``` 
**remove node package locally** ```npm rm  @danhartley/emissions``` 
