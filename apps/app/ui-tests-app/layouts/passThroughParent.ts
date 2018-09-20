export function onOuterWrapLayoutTap() {
    console.log("on outer wrap layout tap");
}

export function onStackLayoutThrowTap() {    
    throw new Error("Should not tap layout with IsPassThroughParentEnabled=true");
}

export function onUserInteractionDisabledTap() {
    throw new Error("Should not tap button with IsUserInteractionEnabled=false");
}

export function onDisabledThrowTap() {
    throw new Error("Should not tap button with IsEnabled=false");
}

export function onTap() {    
    console.log("on button tap");
}