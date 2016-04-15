#!/usr/bin/env node
var fsModule = require('fs');
var resultsFile = 'TestRunResult.txt';
var successMarker = /=== ALL TESTS COMPLETE ===/;
var passMarker = /=== ALL TESTS COMPLETE ===\s+[^\n]*OK,\s+0\s+failed/mg;

var messages = {
    crash: 'TEST RUN CRASHED!',
    runGood: 'Test run exited successfully',
    pass: 'NativeScript Cross-Platform Module Tests passed',
    fail: 'TEST FAILURES FOUND!'
};

var results = fsModule.readFileSync(resultsFile, 'utf-8');

if (!results.match(successMarker)) {
    console.log(messages.crash);
    process.exit(1);
} else if (results.match(passMarker)) {
    console.log(messages.pass);
    process.exit(0);
} else {
    console.log(messages.fail);
    process.exit(1);
}
