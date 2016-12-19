import * as pages from "ui/page";
import * as btns from "ui/button";
import * as layout from "ui/layouts/stack-layout";

export function createPage() {
    var page = new pages.Page();
    var linearLayout = new layout.StackLayout();

    var btn = addButton(linearLayout, "left");
    btn.marginLeft = 100;
    btn = addButton(linearLayout, "center");
    btn.marginTop = 100;
    btn = addButton(linearLayout, "right");
    btn.marginRight = 100;

    btn = addButton(linearLayout, "stretch");
    btn.marginLeft = 100;
    btn.marginRight = 100;
    btn.marginTop = 100;
    btn.marginBottom = 100;

    page.content = linearLayout;
    return page;
}

function addButton(layout: layout.StackLayout, text: "left" | "center" | "middle" | "right" | "stretch") {
    var btn = new btns.Button();
    btn.text = text;
    btn.horizontalAlignment = text;
    layout.addChild(btn);
    layout.style.paddingLeft = 5;
    return btn;
}