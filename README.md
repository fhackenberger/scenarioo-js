# ScenariooJS
> Scenarioo writer library for javascript to document your e2e tests

[![Version](https://badge.fury.io/js/scenarioo-js.png)](http://badge.fury.io/js/scenarioo-js)  [![Build Status](https://travis-ci.org/scenarioo/scenarioo-js.svg?branch=develop)](https://travis-ci.org/scenarioo/scenarioo-js)

Using ScenariooJS in your protractor (or pure [WebDriverJs](https://code.google.com/p/selenium/wiki/WebDriverJs)) e2e tests you can generate a fancy e2e test documentation.

This is a subproject of Scenarioo, for more information on scenarioo, check [http://www.scenarioo.org](http://www.scenarioo.org).

## Use

### IMPORTANT VERSION NOTICE

We are working on a new Version 2.2. We recommend to allready use the Release Candidate of this version.

This Readme here is for the Release Candidate 2.2, that is not yet offcially released.

Advantages of Version 2.2:
* Compatible with Jasmine 2
* Can be used with vanila Jasmine notation
* Comes with more comfortable advanced DSLs
* Can write more additional data to the documentation
* Automatic screenshots on test failures and at end of tests

To use the Release Candidate you have to explicitly refering to the release branch version for now, as follows:

```
npm install --save-dev git://github.com/scenarioo/scenarioo-js.git#release-2.2
```

Or put it into your package.json, as follows:
```
"devDependencies": {    
    "scenarioo-js":"git://github.com/scenarioo/scenarioo-js.git#release-2.2"
}
```

If you still want to use the old officially released ScenariooJS version, you can do so, by refering to the README files in our master branch. But we do not recommend that, because this version is not supported and maintained anymore.

### Installation

Install scenarioo-js via npm

```
$ npm install --save-dev scenarioo-js
```

Make sure to also install protractor (v3.x)

```
$ npm install --save-dev protractor
```

Since protractor comes with command line tools, it is also recommend (for simplicity) to install protractor globally.

```
npm install --global protractor
webdriver-manager update
```

Otherwise you might have to define special scripts in your package.json file to use the command line tools from project's npm dependencies. Which of course is even the best solution to use protractor not as a global dependency.

### Configuration

Configure scenarioo-js in your protractor config file.

```javascript
onPrepare: function onPrepare() {
    
    global.scenarioo = require('scenarioo-js');
    scenarioo.setupJasmineReporter(jasmine, {
      
      targetDirectory: './scenarioReports',
    
      // Information about the current software version being documented
      // usually fetched from your environment (e.g. passed via `process.env`)
      branchName: 'master',  // use your real branch (or product version) that you are documenting here
      branchDescription: 'the master branch',
      buildName: 'build_' + new Date(), // better use unique build identifier, if available
      revision: '1.0.0', // use e.g. git version here (e.g. `git describe --always`) 
      
      // Define a unique human readable identifier of the page the test is currently on (usually a part of the URL)
      pageNameExtractor: function (url) {
        return url.pathname.substring(1);
      },
      
      // Enable automatic screenshot step generated on each expectation failed
      reportStepOnExpectationFailed: true,
      
      // Enable to write last step of a scenario automatically for both failed and passed (=successful) test scenarios
      recordLastStepForStatus: {
         failed: true,
         success: true
      },
      
      // suppress additional helpful scenarioo log output (optional, defaults to false).
      disableScenariooLogOutput: false
      
    });  
      
    // Setup Fluent DSL (only if you need it, which is recommended)
    scenarioo.setupFluentDsl();
    
  }
  
```

### Testing

#### Example Tests

A small example application with Scenarioo tests can be found under [example/](example/). Below we explain different ways to write UI Tests with ScenariooJS. 

For a quick reference, you can also have a look at the the following example files:

 - [Vanilla Jasmine](#vanila-jasmine-style)
    - [exampleBasicJasmine.spec.js](example/test/exampleBasicJasmine.spec.js)
    - [exampleFailingTests.spec.js](example/test/exampleFailingTests.spec.js)
 - [Fluent DSL for simple and clean UI tests _(Recommended)_](#scenarioo-fluent-dsl)
    - [exampleFluentDsl.spec.js](example/test/exampleFluentDsl.spec.js)
    - [exampleFluentDslLabelDefinitions.spec.js](example/test/exampleFluentDslLabelDefinitions.spec.js)
    - [exampleFluentDslPendingUseCase.spec.js](example/test/exampleFluentDslPendingUseCase.spec.js)
 - [Backwards DSL for fast Migration from ScenariooJS 1 to ScenariooJS 2](#backwards-dsl-for-fast-migration)
    - [exampleBackwardsDsl.spec.js](example/test/exampleBackwardsDsl.spec.js)


#### Vanila Jasmine Style

Write your e2e tests in your normal Jasmine style with Protractor (or you could also use pure WebdriverJS without protractor, since ScenariooJS does not depend on protractor specific things).

```javascript

describe('Example Usecase', function() {

  afterEach(scenarioo.saveLastStep);

  it('Example Scenario', function () {

    browser.get('/index.html');
    scenarioo.saveStep('start');

    element(by.css('li#my-item-one')).click();
    scenarioo.saveStep('one is displayed');

  });

});

```

ScenariooJS will report a useCase for every "describe" and a scenario for every "it" function in your test.

Also a step at the end of each test scenario (on failure or success) will be reported if you configured so (see configuration possibilities in `example/protractor.conf.js`).
We allways recommend to turn this on, becasue the last step is one of the most important ones in a test, especially if there are failures.

Additional steps of a scenario can be reported by manually calling `scenarioo.saveStep('stepName');` in your tests.

You could (and probably should) also hook such step commands into your page objects (or even into protractor) to ensure that on every important action (e.g. every important click) a step is reported.

#### Scenarioo Fluent DSL

For a more nicer and clean syntax we recommend to use the **New Fluent DSL** of scenarioo to even more easily describe usecases and scenarios in your tests and annotate them with additional important information for the documentation:

```javascript

useCase('Example Use Case with Fluent DSL')
  .description('An optional but recommended description for the use case')
  .labels(['example-custom-label'])
  .describe(function () {

    scenario('Example Scenario with Fluent DSL')
      .description('An optional but recommended description for the scenario')
      .labels(['happy', 'example-label'])
      .it(function () {

        browser.get('/index.html');
        step('browse to start page');
        
        // you could also hook such step method calls into your page objects or even the e2e test toolkit
        // (e.g. by overwriting protractor functions, like click on element)
        // to automatically document a step on each important interaction and not clutter your tests with such calls
        // (actually that is what we recommend for real projects and can be done easily).

        // more steps of this scenario would of course come here ...

      });
      
});

```

See [Examples](/example) for more information on how to use ScenariooJS and the different DSLs. 

There is also a `Backward DSL` that is only interesting for migrating from old scenarioo 1.x tests to the new scenarioo 2.x with jasmine 2 library more easily, see migration guide below.

#### Defining your own customized application specific test & documentation DSL

In case you want to define your own custom DSL for your specific application under test, to be able to document and test it more easily, you are free to do so, by simply copying our Scenarioo Fluent DSL from this one simple javascript file here as a blueprint for your own DSL:
[fluentDsl.js](/src/dsl/fluentDsl.js)

### Generate and Browse Documentation

Run your protractor tests (e.g. as explained in [Examples Readme](/example/README.MD)) to run the tests and generate scenarioo documentation data. 
This documentation can then be browsed by using the [Scenarioo Viewer Webapp](https://github.com/scenarioo/scenarioo).

## Migration Guide

This migration guide explains how to switch from SceanriooJS 1.x to ScenariooJS 2.x

### Jasmine2 Support

Version 2.x of scenarioo-js will depend on jasmine 2.  jasmine 1.x support will be dropped.
Check the [Examples](/example) for a working example.

### Scenarioo Configuration

The configuration of the reporter has become more easier and has to be changed accordingly in the preparation code of your end-2-end tests.

The `scenarioo.reporter` is not available anymore. Instead you just have to call the setup function `scenarioo.setupJasmineReporter` to setup the reporter for you with jasmine 2.

See documenation above for `Configuration` to see how this works now.

### Application-specific DSL

The `scenarioo.describeScenario` and `scenarioo.describeUseCase` functions are not defined anymore out of the box, 
and have either to be replaced by pure jasmine, a custom written DSL or by one of the out of the box provided DSLs.

We recommend to use the new `Fluent DSL` or your own defined Application-Specific DSL 
but for a fast migration it might be most easy to use the `Backwards DSL`, that is provided only for fast migration.
 
### Backwards DSL for Fast Migration 

Using Backwards DSL you can use the same old functions, that you had in ScenariooJS 0.x and 1.x.

The `Backwards DSL` can be activated as follows:

```
// call this in your protractor onPrepare code to activate backwards DSL functions
scenarioo.setupBackwardsDsl();
```

This brings you the old 1.x style DSL with `describeUseCase` and `describeScenario` functions back, for easier migration
(with or without `scenarioo.` in front, both works).

You can then later migrate those tests to the new `Fluent DSL` or even your own defined DSL or the pure vanila jasmine 2 syntax.
We recommend to have a look at the new [Examples](/example) to see what style fits best for your project.

### Save Steps with `scenarioo.saveStep`

The "saveStep" function is now directly exposed on scenarioo:

```javascript
scenarioo.describeUseCase('Example Usecase', function () {

  scenarioo.describeScenario('Example Scenario ', function () {
    scenarioo.saveStep('start'); // instead of scenarioo.docuWriter.saveStep
  });

});
```
