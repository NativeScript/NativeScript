declare var setTimeout, clearTimeout, setInterval, clearInterval;
import timer = require("timer/timer");
import consoleModule = require("Console/console");

setTimeout = timer.setTimeout;
clearTimeout = timer.clearTimeout;
setInterval = timer.setInterval;
clearInterval = timer.clearTimeout;

console = new consoleModule.Console();