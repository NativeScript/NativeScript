import pagesModule = require("ui/page");
import frameModule = require("ui/frame");
import buttonModule = require("ui/button");
import controlsPageModule = require("../controls-page");

export function createPage() {
    var page = new pagesModule.Page();

    var buttonCtor;
    buttonCtor = buttonModule.Button;

    var startButton = new buttonModule.Button();
    startButton.text = "GO!";

    var counter = 0;
    var forwardIntervalId;
    var backIntervalId;

    startButton.on(buttonModule.knownEvents.tap, function () {

        forwardIntervalId = setInterval(function () {
            console.log("Navigating to controls page...");

            var pageFactory = function () {
                return new controlsPageModule.ControlsPage(buttonCtor, 100, 10);
            };
            frameModule.topmost().navigate(pageFactory);

            backIntervalId = setTimeout(function () {
                console.log("Going back...");
                frameModule.topmost().goBack();
                counter++;

                if (counter === 10) {
                    clearInterval(forwardIntervalId);
                }

            }, 500);

        }, 1000);

    });

    page.content = startButton;
    return page;
}
