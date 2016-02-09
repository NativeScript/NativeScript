import frame = require("ui/frame");
import pages = require("ui/page");

export function onTap(args) {
    var navigationEntry = {
        moduleName: "transitions/page1",
        animated: true,
        navigationTransition: {
            transition: args.object.tag,
            duration: 380,
            curve: "easeIn"
        }
    };
    frame.topmost().navigate(navigationEntry);
}