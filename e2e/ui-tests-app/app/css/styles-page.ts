import { addCss } from "tns-core-modules/application";

export function onLoaded(args) {
    var page = args.object;
    page.addCss("#property { background-color: lightsalmon; }");
}

export function onTap() {
    addCss("#app { background-color: lightblue; }");
}
