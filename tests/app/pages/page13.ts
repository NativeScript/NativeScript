import * as pages from "ui/page";
import * as btns from "ui/button";
import * as layout from "ui/layouts/stack-layout";

export function createPage() {
    var page = new pages.Page();
    var linearLayout = new layout.StackLayout();

    var btn = addButton(linearLayout, "left");
    btn.marginLeft = { value: 100, unit: "dip" };
    btn = addButton(linearLayout, "center");
    btn.marginTop = { value: 100, unit: "dip" };
    btn = addButton(linearLayout, "right");
    btn.marginRight = { value: 100, unit: "dip" };

    btn = addButton(linearLayout, "stretch");
    btn.marginLeft = { value: 100, unit: "dip" };
    btn.marginRight = { value: 100, unit: "dip" };
    btn.marginTop = { value: 100, unit: "dip" };
    btn.marginBottom = { value: 100, unit: "dip" };

    page.content = linearLayout;
    return page;
}

function addButton(layout: layout.StackLayout, text: "left" | "center" | "middle" | "right" | "stretch") {
    var btn = new btns.Button();
    btn.text = text;
    btn.horizontalAlignment = text;
    layout.addChild(btn);
    layout.style.paddingLeft = { value: 5, unit: "dip" };
    return btn;
}