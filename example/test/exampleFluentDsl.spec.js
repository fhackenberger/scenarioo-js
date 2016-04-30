/**
 *  Example for using the new scenarioo fluent DSL to test and document the usecases and scenarios
 *  of your application more explicitly than with jasmine describe and it functions.
 *
 *  This is what we recommend to use for more complex real projects.
 *
 *  The DSL is included in scenarioo and can be easily extended to application specific stuff,
 *  by extending the DSL provided by ScenariooJS.
 *
 *  Or you could also simply define your own DSL, just look at the file fluentDsl.js in the scenarioo sources,
 *  to see how easily your own DSL could be defined or how you could extend the existing one
 *  that you can take as a blueprint.
 *
 *  This example only works, when you call scenarioo.setupFluentDsl() in your protractor onPrepare function.
 */

require('./exampleFluentDslLabelDefinitions');

/**
 * The use case description
 */
useCase('Example Use Case with Fluent DSL')
  .description('An optional but recommended description for the use case')
  .labels(['example-custom-label'])
  .describe(function () {

    /**
     * A scenario description
     */
    scenario('Example Scenario with Fluent DSL')
      .description('An optional but recommended description for the scenario')
      .labels(['happy', 'example-label'])
      .it(function () {

        browser.get('/index.html');

        // use scenarioo's saveStep method to document interaction steps inside the scenario (with screenshot, etc.)
        step('browse to start page');
        // you could also hook such saveStep method calls into your page objects or even the e2e test toolkit
        // (e.g. by overwriting protractor functions, like click on element)
        // to automatically document a step on each important interaction and not clutter your tests with such calls
        // (actually that is what we recommend for real projects and can be done easily).

        // more steps of this scenario would of course come here ...

      });

    scenario('Example Failing Scenario with several expectation failures')
      .description('This scenario should demonstrate that also for each failed expectation a screenshot is taken')
      .it(function exampleScenarioWithMultipleExpectationsFailingAndNoLabels() {

        browser.get('/index.html');
        expect(element.all(by.css('.element-not-existing')).count()).toBe(78); // will fail --> expectation failed step

        element(by.css('li#item_one')).click();
        step('item one clicked');

        expect(element.all(by.css('.another-element-not-existing')).count()).toEqual(13); // will fail --> expectation failed step

        element(by.css('li#item_is_not_present')).click(); // will fail the scenario --> scenario failed step
        expect(element.all(by.css('.another-element-not-existing-after-scenario-failed')).count()).toEqual(6); // will not be executed (no step)

      });

    scenario('Example Failing Scenario that throws an Error')
      .description('This scenario just tests that thwoing an Error in a scenario is reported nicely')
      .it(function exampleScenarioWhichThrowsError() {

        throw Error('Something went wrong in a test (this is expected test failure, just for demonstration purposes!)');

      });

    /**
     * Another scenario ...
     * This one is set to pending, which means it is a currently not yet working test (=work in progress)
     */
    scenario('Example Pending Scenario')
      .description('An optional description for the scenario')
      .pending('Put a comment here, why this scenario is currently put to be pending (is recommended to be used in favour of xit!)')
      .it(function examplePendingScenario() {

      });

  });