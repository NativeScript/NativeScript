import { View, EventData } from "ui/core/view";

export function setClass(args: EventData) {
    const btn = (<View & { tag: any }>args.object);
    const img = btn.page.getViewById<View>("img");
    img.className = btn.tag;
}

export function setImg2Class(args: EventData) {
    const btn = (<View & { tag: any }>args.object);
    const img2 = btn.page.getViewById<View>("img2");
    img2.className = btn.tag;
}
