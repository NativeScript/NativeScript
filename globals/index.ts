declare var module, setTimeout, clearTimeout, setInterval, clearInterval;
import timer = require("timer/timer");
module.exports = timer;

setTimeout = timer.setTimeout;
clearTimeout = timer.clearTimeout;
setInterval = timer.setInterval;
clearInterval = timer.clearTimeout;