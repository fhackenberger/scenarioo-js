'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _contextFactory = require('./contextFactory');

var _contextFactory2 = _interopRequireDefault(_contextFactory);

var _docuWriter = require('./docuWriter/docuWriter');

var _docuWriter2 = _interopRequireDefault(_docuWriter);

var _jasmine = require('./reporters/jasmine');

var _jasmine2 = _interopRequireDefault(_jasmine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @namespace scenarioo
 */
var scenarioo = {

  reportingEnabled: false,

  // TODO: in the future, when we support different reporters for different testing-frameworks, the user would want to configure which reporter to use.

  /**
   * Configuration
   */
  options: {},

  /**
   * Instantiates the scenarioo reporter (currently jasmine) that can be registered with the jasmine env `jasmine.getEnv().addReporter(scenarioo.reporter(....));`
   * Usually this is invoked in your protractor config file.
   *
   * @func scenarioo#setupJasmineReporter
   * @param {object} pass the jasmine instance to use for setup (usualy the global 'jasmine')
   * @param {object} options
   * @param {string} options.targetDirectory - The path to the target directory
   * @param {string} options.branchName
   * @param {string} options.branchDescription
   * @param {string} options.buildName
   * @param {string} options.revision
   * @param {function} [options.pageNameExtractor] - A custom function to extract the pageName from the url. Scenarioo will pass in a node.js url object.
   *
   */
  setupJasmineReporter: function setupJasmineReporter(jasmine, options) {
    scenarioo.reportingEnabled = true;
    if (options) {
      scenarioo.options = options;
    }
    var reporter = (0, _jasmine2.default)(jasmine, scenarioo.options);
    jasmine.getEnv().addReporter(reporter);
  },

  /**
   * Setup the backwards DSL which defines global functions `defineUseCase` and `defineScenario` to replace old
   * `scenarioo.defineScenario` and `scenarioo.defineUseCase` functions for more easily migrating from tests
   * using old version 1.x of ScenariooJS.
   *
   * Instead of using this DSL for easy migration we recommend to migrate your tests to use the new Fluent DSL
   * (or it is also possible to use both DSLs in parallel to more easily migrate step by step to using the new DSL).
   *
   * See examples for how to use it.
   */
  setupBackwardsDsl: function setupBackwardsDsl() {
    require('./dsl/backwardsDsl.js');
  },

  /**
   * Setup the new Fluent DSL to write e2e tests with scenarioo more easily.
   *
   * This defines global functions `usecase`, `scenario` and `step` to use for describing your e2e tests.
   *
   * See examples for how to use it.
   */
  setupFluentDsl: function setupFluentDsl() {
    require('./dsl/fluentDsl.js');
  },

  /**
   * Will return the context for the current useCase.
   * Allows you to set additional information like "description" and "labels"
   *
   * @func scenarioo#getUseCaseContext
   * @returns {context}
   */
  getUseCaseContext: function getUseCaseContext() {
    return (0, _contextFactory2.default)('useCase');
  },

  /**
   * will return the context for the current scenario.
   * Allows you to set additional information like "description" and "labels"
   *
   * @func scenarioo#getScenarioContext
   * @returns {context}
   */
  getScenarioContext: function getScenarioContext() {
    return (0, _contextFactory2.default)('scenario');
  },

  /**
   * Call this in your e2e test functions whenever you want scenarioo to report a step (with screen shot and metadata, etc.)
   *
   * @func scenarioo#saveStep
   * @param {string} [stepName]
   * @param {object} [additionalProperties]
   * @param {string[]} [additionalProperties.labels]
   * @param {object[]} [additionalProperties.screenAnnotations]
   * @returns {Promise} The returned promise will resolve to an object containing the saved step object, the path to the step xml file as well as the path to the screenshot file
   */
  saveStep: function saveStep() {

    if (!scenarioo.reportingEnabled) {
      return; // just do nothing when scenarioo is disabled.
    }

    // make sure that "scenarioo.saveStep()" gets added to the protractor controlFlow
    // this ensures that the save operation is not invoked immediately, but in-sync with the flow.
    // We do this wrapping here in order to keep docuWriter simple (not another dependency to protractor)
    var stepArguments = arguments;
    browser.controlFlow().execute(function () {
      return _docuWriter2.default.saveStep.apply(_docuWriter2.default, stepArguments);
    });
  },

  /**
   * MUST be called in an afterEach (and only in afterEach!), to ensure that all steps are written before the test is finished.
   */
  saveLastStep: function saveLastStep() {

    if (!scenarioo.reportingEnabled) {
      return; // just do nothing when scenarioo is disabled.
    }

    // ensure to schedule at least one dummy protractor task here (in any case!!)
    // just to cause protractor to wait for flow to finish, before calling specDone.
    browser.controlFlow().execute(function () {
      var status = scenarioo.getScenarioContext().getCurrent().status;
      status = status || 'success'; // not yet set = assuming success.
      if (scenarioo.options.recordLastStepForStatus) {
        if (scenarioo.options.recordLastStepForStatus[status]) {

          // Put a label on failure steps
          var labels = [];
          if (status === 'failed') {
            labels = ['failed'];
          }

          // Report step with status and failure label
          scenarioo.saveStep('scenario ' + status, { status: status, labels: labels });
        }
      }
    });
  }

};

exports.default = scenarioo;