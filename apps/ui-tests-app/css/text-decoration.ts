var obj;

export function loaded(args) {
    obj = args.object;
}

export function butonTap(args) {
    if (obj.style.textDecoration === "underline") {
        obj.style.textDecoration = "line-through";
    } else if (obj.style.textDecoration === "line-through") {
        obj.style.textDecoration = "line-through underline";
    } else if (obj.style.textDecoration === "line-through underline") {
        obj.style.textDecoration = "none";
    } else if (obj.style.textDecoration === "none") {
        obj.style.textDecoration = "underline";
    }
}