import {FlexboxLayout} from "ui/layouts/flexbox-layout";

function set(what: string) {
    return function(args) {
        args.object.page.getViewById("container")[what] = args.object.text;
    }
}

export const flexDirection = set("flexDirection");
export const flexWrap = set("flexWrap");
export const justifyContent = set("justifyContent");
export const alignItems = set("alignItems");
export const alignContent = set("alignContent");

let lastSelection = null;
export function select(args) {
    if (lastSelection) {
        lastSelection.selected = "no";
        lastSelection.notify({ eventName: "selectedChange", object: lastSelection });
    }
    lastSelection = args.object;
    if (lastSelection) {
        lastSelection.selected = "yes";
        lastSelection.notify({ eventName: "selectedChange", object: lastSelection });
    }
}

let whenSelected = handler => args => lastSelection && handler(args);
let setProperty = setter => value => setter(lastSelection, value);
let intHandler = handler => ({object}) => handler(parseInt(object.text));
let stringHandler = handler => ({object}) => handler(object.text);
let booleanHandler = handler => ({object}) => handler(object.text === "true");

export const order = whenSelected(intHandler(setProperty(FlexboxLayout.setOrder)));
export const flexGrow = whenSelected(intHandler(setProperty(FlexboxLayout.setFlexGrow)));
export const flexShrink = whenSelected(intHandler(setProperty(FlexboxLayout.setFlexShrink)));
export const alignSelf = whenSelected(stringHandler(setProperty(FlexboxLayout.setAlignSelf)));
export const flexWrapBefore = whenSelected(booleanHandler(setProperty(FlexboxLayout.setFlexWrapBefore)));

