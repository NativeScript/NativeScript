export const flexFlow = applyCss();

function applyCss() {
    return function(args) {
        // args.object.page.getViewById("container")[what] = args.object.text;
        let boxCss = " #container { " + args.object.tag + " }" ;
        // console.log(boxCss);
        args.object.page.addCss(boxCss);
        console.log(args.object.page.css);
    }
}

export function applyStyles(args) {
    // var css = "#test-element { " + args.object.tag + " }";
    console.log(args.object.tag);
    args.object.page.addCss(args.object.tag);
}

export function resetTap(args) {
    args.object.page.css = "";
}
