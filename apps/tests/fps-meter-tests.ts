// <snippet module="fps-meter" title="fps-meter">
// # Frames-per-second meter
// Logging frames-per-second statistics for your app requires the "fps-meter" module.
// ``` JavaScript
import fpsMeter = require("fps-meter");
// ```
// </snippet>

export var test_DummyTestForSnippetOnly0 = function () {
    // <snippet module="fps-meter" title="fps-meter">
    // ### Start and stop logging
    // ``` JavaScript
    var callbackId = fpsMeter.addCallback(function (fps: number, minFps: number) {
        console.info("fps=" + fps + " minFps=" + minFps);
    });
    fpsMeter.start();
    ////...
    fpsMeter.removeCallback(callbackId);
    fpsMeter.stop();
    // ```
    // </snippet>
}