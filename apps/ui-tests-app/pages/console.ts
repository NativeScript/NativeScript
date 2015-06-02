export function pageLoaded() {
    console.log("### TEST START ###.");
    onTapTrue();
    onTapFalse();
    onTapText();
    onTapNull();
    onTapUndefined();
    console.log("### TEST END ###.");
}

export function onTapTrue() {
    console.log(true);
}

export function onTapFalse() {
    console.log(false);
}

export function onTapText() {
    console.log("text");
}

export function onTapNull() {
    console.log(null);
}

export function onTapUndefined() {
    console.log(undefined);
}