var
  assert = require('assert'),
  _ = require('lodash'),
  sinon = require('sinon'),
  store = require('../../../lib/scenariooStore'),
  jasmineReporter = require('../../../lib/reporters/jasmine');

describe('scenariooJasmineReporter', function () {
  var reporter;

  beforeEach(function () {
    store.clear();
  });
  afterEach(function () {
    store.clear();
  });

  // all of these hook functions get invoked by jasmine. let's assert that our scenarioo state is correctly manipulated
  describe('state manipulation', function () {

    beforeEach(function () {
      reporter = jasmineReporter({
        targetDirectory: './test/out/docu',
        branchName: 'reporterTest-state-manipulation',
        branchDescription: 'reporterTestBranch',
        buildName: 'reporterTestBuild',
        revision: '0.0.1'
      });

      reporter.jasmineStarted();
    });

    it('#jasmineStarted()', function () {
      var state = store.dump();
      assert(state.branch);
      assert(state.build);
      assert(state.build.date);
    });

    it('#suiteStarted()', function () {

      reporter.suiteStarted({
        id: 'suite1',
        description: 'The useCase'
      });
      var state = store.dump();
      assert(state.currentUseCase);
      assert.equal(state.currentUseCase.name, 'The useCase');

    });

    it('#specStarted()', function () {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'UC 1'
      });

      // now invoke specStarted
      var spec = {
        id: 'spec1',
        description: 'SC 1'
      };
      reporter.specStarted(spec);

      var state = store.dump();
      assert(state.currentScenario);
      assert.equal(state.currentScenario.name, 'SC 1');
    });

    it('#specDone() pending', function () {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'Some use case'
      });
      reporter.specStarted({
        id: 'spec1',
        description: 'Some scenario'
      });

      // now invoke specDone
      reporter.specDone({
        id: 'spec1',
        status: 'pending',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });
      var state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.currentUseCase.skippedScenarios, 1);
    });

    it('#specDone() success', function () {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'Some use case'
      });
      reporter.specStarted({
        id: 'spec1',
        description: 'Some scenario'
      });

      // now invoke specDone
      reporter.specDone({
        id: 'spec1',
        status: 'passed',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });

      var state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.currentUseCase.passedScenarios, 1);
    });

    it('#specDone() failed', function () {
      // prepare
      reporter.suiteStarted({
        id: 'suite1',
        description: 'Some use case'
      });
      reporter.specStarted({
        id: 'spec1',
        description: 'Some scenario'
      });

      // now invoke specDone
      reporter.specDone({
        id: 'spec1',
        status: 'failed',
        description: 'My Super Spec',
        _suite: {id: 'suite1'}
      });

      var state = store.dump();
      assert(!state.currentScenario, 'currentScenario must be reset');
      assert.equal(state.currentUseCase.failedScenarios, 1);
    });

  });


  describe('whole lifecylce', function () {

    var docuWriter = require('../../../lib/docuWriter/docuWriter');

    before(function () {
      // let's wrap docuWriter's methods with sinon spies
      // this allows us to assert jasmineReporter calls docuWriter in an expected way
      sinon.spy(docuWriter, 'start');
      sinon.spy(docuWriter, 'saveScenario');
      sinon.spy(docuWriter, 'saveUseCase');
      sinon.spy(docuWriter, 'saveBuild');
    });

    after(function () {
      // make sure to remove our spies
      docuWriter.start.restore();
      docuWriter.saveScenario.restore();
      docuWriter.saveUseCase.restore();
      docuWriter.saveBuild.restore();
    });

    it('should invoke docuWriter as expected', function () {

      reporter = jasmineReporter({
        targetDirectory: './test/out/docu',
        branchName: 'reporterTest-lifecycle',
        branchDescription: 'reporterTestBranch',
        buildName: 'reporterTestBuild',
        revision: '0.0.1'
      });

      var dummyObjects = {
        useCaseOne: {
          id: 'suite1',
          description: 'useCase will fail',
          additionalDescription: 'some more info'
        },
        scenarioOne: {
          id: 'spec1',
          description: 'spec will fail',
          additionalDescription: 'more'
        },
        useCaseTwo: {
          id: 'suite2',
          description: 'useCase will succeed',
          additionalDescription: 'some more info juhuu'
        },
        scenarioTwo: {
          id: 'spec2',
          description: 'spec will suceed',
          additionalDescription: 'more juhuu'
        }
      };

      reporter.jasmineStarted();

      // --- first useCase with one failing spec

      reporter.suiteStarted({
        id: dummyObjects.useCaseOne.id,
        description: dummyObjects.useCaseOne.description
      });

      reporter.specStarted({
        id: dummyObjects.scenarioOne.id,
        description: dummyObjects.scenarioOne.description
      });

      reporter.specDone({
        id: dummyObjects.scenarioOne.id,
        description: dummyObjects.scenarioOne.description,
        status: 'failed',
        _suite: {id: dummyObjects.useCaseOne.id, description: dummyObjects.useCaseOne.description}
      });

      reporter.suiteDone({
        isUseCase: true,
        status: 'success',
        id: dummyObjects.useCaseOne.id,
        description: dummyObjects.useCaseOne.description
      });

      // --- second useCase with one succeeding spec

      reporter.suiteStarted({
        id: dummyObjects.useCaseTwo.id,
        description: dummyObjects.useCaseTwo.description
      });

      reporter.specStarted({
        id: dummyObjects.scenarioTwo.id,
        description: dummyObjects.scenarioTwo.description
      });

      reporter.specDone({
        id: dummyObjects.scenarioTwo.id,
        description: dummyObjects.scenarioTwo.description,
        status: 'passed',
        _suite: {id: dummyObjects.useCaseTwo.id, description: dummyObjects.useCaseTwo.description}
      });

      reporter.suiteDone({
        isUseCase: true,
        status: 'finished',
        id: dummyObjects.useCaseTwo.id,
        description: dummyObjects.useCaseTwo.description
      });

      reporter.jasmineDone();


      // Now let's assert that the reporter called docuWriter as expected
      // in general, let's not assert too much -> no complete whitebox test of the reporter -  or this tests gets very brittle


      assert.equal(docuWriter.start.callCount, 1);
      assert.equal(docuWriter.saveScenario.callCount, 2);
      assert.equal(docuWriter.saveUseCase.callCount, 2);
      assert.equal(docuWriter.saveBuild.callCount, 1);

      assert(_.isPlainObject(docuWriter.start.getCall(0).args[0]), 'docuWriter.start must be called with the branch object as first parameter');

      assert.equal(docuWriter.saveScenario.getCall(0).args.length, 2, 'docuWriter.saveUseCase must be called with two argument');
      assert(_.isPlainObject(docuWriter.saveScenario.getCall(0).args[0]), 'docuWriter.saveScenario must be called with the current scenario object as first parameter');
      assert(_.isString(docuWriter.saveScenario.getCall(0).args[1]), 'docuWriter.saveScenario must be called with the useCase name as second parameter');

      assert.equal(docuWriter.saveUseCase.getCall(0).args.length, 1, 'docuWriter.saveUseCase must be called with one argument');
      assert(_.isPlainObject(docuWriter.saveUseCase.getCall(0).args[0]), 'docuWriter.saveUseCase must be called with the current useCase object as first parameter');

      assert.equal(docuWriter.saveBuild.getCall(0).args.length, 1, 'docuWriter.saveBuild must be called with one argument');
      assert(_.isPlainObject(docuWriter.saveBuild.getCall(0).args[0]), 'docuWriter.saveBuild must be called with the build object as first parameter');


    });
  });

});