declare var setTimeout, clearTimeout, setInterval, clearInterval;
import timer = require("timer/timer");
import consoleModule = require("console/console");

setTimeout = timer.setTimeout;
clearTimeout = timer.clearTimeout;
setInterval = timer.setInterval;
clearInterval = timer.clearTimeout;

console = new consoleModule.Console();