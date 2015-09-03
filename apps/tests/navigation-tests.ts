import TKUnit = require("./TKUnit");
import pageModule = require("ui/page");
import frame = require("ui/frame");

export var test_backstackVisible = function() {
    var pageFactory = function (): pageModule.Page {
        return new pageModule.Page();
    };

    var mainTestPage = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== mainTestPage; });

    // page1 should not be added to the backstack
    var page0 = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory, backstackVisible: false });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== page0; });

    var page1 = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== page1; });

    var page2 = frame.topmost().currentPage;
    frame.topmost().goBack();
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== page2; });

    // From page2 we have to go directly to page0, skipping page1.
    TKUnit.assert(frame.topmost().currentPage === page0, "Page 1 should be skipped when going back.");

    frame.topmost().goBack();
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage === mainTestPage; });
}