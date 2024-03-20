#!/usr/bin/env node
const fs = require("fs");
const glob = require("glob");
const libxmljs = require("libxmljs2");
const argv = require('minimist')(process.argv.slice(2));

if (!argv["i"]) {
  console.log("Missing -i for input file")
  process.exit(1);
}

const junit = argv["i"]

let totalTests = 0;
let failedTests = 0;
let failedTestDetails = [];
let allTests = [];

glob(junit, async function (err, files) {
  for (let index = 0; index < files.length; index++) {
    var xmlDoc = libxmljs.parseXml(fs.readFileSync(files[index]));
    var suites = xmlDoc.find("//testsuite");
    suites.forEach((suite) => {
      totalTests += parseInt(suite.attr("tests").value());
      failedTests += parseInt(suite.attr("failures").value());
      var tests = suite.find("//testcase");
      tests.forEach((test) => {
        allTests.push(test)
        test.childNodes().forEach((failure) => {
          if (failure.name() === "failure") {
            const suiteName = suite.attr("name").value()
            const testName = test.attr("name").value()
            failedTestDetails.push(`${suiteName}/${testName}`);
          }
        });
      });
    });
  }

  outputText();
});

function outputText() {
  const output = ["### Test Failures:"]
  if (failedTestDetails.length > 0) {
    for (let index = 0; index < failedTestDetails.length; index++) {
      output.push(`- ${failedTestDetails[index]}`)
    }
    console.log(output.join(`\n`))
  } else if (totalTests > 0) {
    console.log("No failing tests, awesome!");
  } else {
    console.log("No tests found.");
  }
}
