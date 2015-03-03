import pages = require("ui/page");
import labelModule = require("ui/label");
import common = require("../common");
import trace = require("trace");
import cn = require("console/console-native");

export function createPage() {
    var count = 2000000;
    var people = [];

    var page = new pages.Page();
    var label = new labelModule.Label();
    page.content = label;
    
    trace.write("Creating " + count + " objects.", trace.categories.Test, trace.messageType.info);
    var startTime = cn.timeMillis();
    for (var i = 0; i < count; i++) {
        people[i] = new common.Person("John Doe", 33, 1234.56);
    }
    var elapsedTime = Math.round(cn.timeMillis() - startTime);
    var message = "Created " + people.length + " objects in " + elapsedTime + " ms.";
    trace.write(message, trace.categories.Test, trace.messageType.info);
    label.text = message;
    return page;
}