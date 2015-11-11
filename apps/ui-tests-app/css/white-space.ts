var obj;

export function loaded(args) {
    obj = args.object;
}

export function butonTap(args) {
    if (obj.style.whiteSpace === "normal") {
        obj.style.whiteSpace = "nowrap";
    } else if (obj.style.whiteSpace === "nowrap") {
        obj.style.whiteSpace = "normal";
    }
}