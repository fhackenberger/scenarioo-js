# ScenariooJS - Release Process

* Draft the release notes on GitHub (https://github.com/scenarioo/scenarioo-js/releases)
  * Use semantic versioning
  * No `v` prefix for version number
  * Target: master
  * Meaningful title and descriptions (see previous releases)
  * **Save only as Draft!**

* Set correct version in package.json and run a full build

* **Run tests**:
    * `gulp test`
    * run all examples and check it works as expected
    * also test generated output from examples can be read by Viewer Webapp (import generated output)    

* Commit everything to develop.

* Wait for Travis CI Build to complete (https://travis-ci.org/scenarioo/scenarioo-js).

* Merge develop branch into master branch.

* Tag the master branch with the new release version (`git tag x.x.x`)

* Commit the master branch and the version tag (`git push --tags`)

* Publish new version to npm repository (`npm publish`). You need to have the necessary permissions on npmjs.com.

* Publish the new release on GitHub (the one that you drafted already).

* Use the new version in your tests and make sure the output it produces can be read by the Scenarioo Viewer Web App