import path from 'path';
import assert from 'assert';
import Q from 'q';
import testHelper from '../../utils/testHelper';
import mockWebdriver from '../../utils/mockGlobals';
import docuWriter from '../../../src/docuWriter/docuWriter';
import store from '../../../src/scenariooStore';
import { sanitizeForId } from '../../../src/docuWriter/identifierSanitizer';

before(() => {
  mockWebdriver.registerMockGlobals();
});

describe('docuWriter', () => {

  /** let's set up some dummy objects **/
  const targetDir = './test/out/docu';

  const dummyBranch = {
    name: 'my unsafe branch name, will',
    description: 'my safe description'
  };

  const buildName = 'some build name';

  const dummyUseCase = {
    name: 'use case name, toll!',
    description: 'some description with special chars ;) %&',
    status: 'success',
    labels: []
  };

  const dummyScenario = {
    name: ' some cool scenario name',
    description: 'scenario description',
    status: 'success'
  };

  describe('#start()', () => {

    it('should write branch directory on start()', () => {
      docuWriter.start(dummyBranch, 'some build name', targetDir, {})
        .then(() => testHelper.assertFileExists(path.join(targetDir, sanitizeForId(dummyBranch.name))));
    });

    it('should write branch.json on start() with all attributes', () => {
      return docuWriter.start(dummyBranch, 'some build name', targetDir, {})
        .then(() => testHelper.assertJsonContent(path.join(targetDir, sanitizeForId(dummyBranch.name) + '/branch.json'), dummyBranch));
    });
  });

  describe('#saveBuild()', () => {

    beforeEach(()  => {
      return docuWriter.start(dummyBranch, 'save_build_test', targetDir, {});
    });

    it('should save mandatory fields correctly build.json', () => {
      const buildDate = new Date();
      const build = {
        id: 'save_build_test',
        name: 'save_build_test',
        date: buildDate.toISOString(),
        status: 'failed'
      };

      return docuWriter.saveBuild(build, targetDir)
        .then(() => testHelper.assertJsonContent(path.join(targetDir, `${sanitizeForId(dummyBranch.name)}/${build.id}/build.json`), build));
    });
  });


  describe('#saveUseCase()', () => {

    beforeEach(() => {
      docuWriter.start(dummyBranch, buildName, targetDir, {});
    });

    it('should create useCase directory', () => {
      const expectedPath = `${sanitizeForId(dummyBranch.name)}/${sanitizeForId(buildName)}/${sanitizeForId(dummyUseCase.name)}`;
      return docuWriter.saveUseCase(dummyUseCase)
        .then(() => testHelper.assertFileExists(path.join(targetDir, expectedPath)));
    });

    it('should create usecase.json', () => {
      const expectedPath = `${sanitizeForId(dummyBranch.name)}/${sanitizeForId(buildName)}/${sanitizeForId(dummyUseCase.name)}/usecase.json`;
      return docuWriter.saveUseCase(dummyUseCase)
        .then(() => testHelper.assertJsonContent(path.join(targetDir, expectedPath), dummyUseCase));
    });
  });

  describe('#saveScenario()', () => {

    beforeEach(() => {
      docuWriter.start(dummyBranch, 'some build name', targetDir, {});
      return docuWriter.saveUseCase(dummyUseCase);
    });

    it('should save scenario directory', () => {
      const expectedPath = `${sanitizeForId(dummyBranch.name)}/${sanitizeForId(buildName)}/${sanitizeForId(dummyUseCase.name)}/${sanitizeForId(dummyScenario.name)}`;
      return docuWriter.saveScenario(dummyScenario, dummyUseCase.name)
        .then(() => testHelper.assertFileExists(path.join(targetDir, expectedPath)));
    });

    it('should save scenario.json', () => {
      const expectedPath = `${sanitizeForId(dummyBranch.name)}/${sanitizeForId(buildName)}/${sanitizeForId(dummyUseCase.name)}/${sanitizeForId(dummyScenario.name)}/scenario.json`;
      return docuWriter.saveScenario(dummyScenario, dummyUseCase.name)
        .then(() => testHelper.assertJsonContent(path.join(targetDir, expectedPath), dummyScenario));
    });

  });

  describe('#saveStep()', () => {
    const useCaseName = 'UseCaseDescription';
    const scenarioName = 'ScenarioDescription';
    const expectedBasePath = `${sanitizeForId(dummyBranch.name)}/${sanitizeForId(buildName)}/${sanitizeForId(useCaseName)}/${sanitizeForId(scenarioName)}`;

    beforeEach(() => {
      docuWriter.start(dummyBranch, buildName, targetDir, {});
      store.init(dummyBranch.name, dummyBranch.description, buildName);
      store.updateCurrentUseCase({name: useCaseName});
      store.updateCurrentScenario({name: scenarioName});
    });

    it('should save a step', () => {
      return docuWriter.saveStep('my step')
        .then(() => testHelper.assertFileExists(path.join(targetDir, `${expectedBasePath}/steps/000.json`)));
    });

    it('should save a step with default pagename', () => {

      docuWriter.registerPageNameFunction(undefined);

      return docuWriter.saveStep('my step')
        .then(result => {
          assert.equal(result.step.page.name, '#_somepage');
          assert.equal(result.step.index, 0);
        });
    });

    it('should increase stepCounter', () => {
      var firstSave = docuWriter.saveStep('my step 1')
        .then(result => {
          assert.equal(result.step.index, 0);
        });
      var secondSave = docuWriter.saveStep('my step 2')
        .then(result => {
          assert.equal(result.step.index, 1);
        });

      return Q.all([firstSave, secondSave]);
    });

    it('should save a step with custom pagename function', () => {
      docuWriter.registerPageNameFunction(url => {
        var pos = url.href.indexOf('#');
        if (pos > -1) {
          return url.href.substring(pos + 1);
        } else {
          return url.href;
        }
      });

      return docuWriter.saveStep('my step')
        .then(result => {
          assert.equal(result.step.page.name, '_somepage');
        });
    });

    it('should save a step with additional information (labels)', () => {
      return docuWriter.saveStep('my step', {
        labels: ['red']
      })
        .then(result => {
          return assert.deepEqual(result.step.labels, ['red']);
        });
    });

    it('should save a step without name but additional attributes', () => {
      return docuWriter.saveStep({
        labels: ['red']
      })
        .then(result => {
          return assert.deepEqual(result.step.labels, ['red']);
        });
    });

    it('should save a step with additional information (screen annotations)', () => {
      return docuWriter.saveStep('my step', {
        screenAnnotations: [{
          x: 758,
          y: 462,
          width: 55,
          height: 28,
          style: 'CLICK',
          screenText: 'a text',
          title: 'Clicked Button',
          description: 'User clicked on button'
        }]
      })
        .then(result => {
          var screenAnnotations = result.step.screenAnnotations;
          return assert.deepEqual(screenAnnotations, [
            {
              region: {x: 758, y: 462, width: 55, height: 28},
              style: 'CLICK',
              screenText: 'a text',
              title: 'Clicked Button',
              description: 'User clicked on button'
            }
          ]);
        });
    });
  });
});
