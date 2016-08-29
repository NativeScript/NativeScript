import application = require("application");
declare var CACurrentMediaTime;

global.time = function(): number {
    if (global.android) {
        return java.lang.System.nanoTime() / 1000000; // 1 ms = 1000000 ns
    }
    else {
        return CACurrentMediaTime() * 1000;
    }
}

application.start({ moduleName: "css-perf-test/root" });