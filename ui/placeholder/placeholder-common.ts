import definition = require("ui/placeholder");
import view = require("ui/core/view");

export module knownEvents {
    export var creatingView = "creatingView";
}

export class Placeholder extends view.View implements definition.Placeholder {
}