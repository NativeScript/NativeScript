import definition = require("ui/placeholder");
import view = require("ui/core/view");

export class Placeholder extends view.View implements definition.Placeholder {
    public static creatingViewEvent = "creatingView";
}