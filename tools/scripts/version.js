var fs = require("fs");
console.log(JSON.parse(fs.readFileSync("./bin/dist/tns-core-modules/package.json")).version);