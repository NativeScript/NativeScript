declare var setTimeout, clearTimeout, setInterval, clearInterval, console;
import timer = require("timer/timer");
import consoleModule = require("console/console");

setTimeout = timer.setTimeout;
clearTimeout = timer.clearTimeout;
setInterval = timer.setInterval;
clearInterval = timer.clearTimeout;

console = new consoleModule.Console();