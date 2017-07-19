import { Image, Stretch } from "tns-core-modules/ui/image";
import { Label } from "tns-core-modules/ui/label";
import { LayoutBase } from "tns-core-modules/ui/layouts/layout-base";
import { Color } from "tns-core-modules/color";
import * as imageSource from "tns-core-modules/image-source";

const sources = [ "i16x9", "i9x9", "i16x16", "i9x16" ].map(i => `~/ui-tests-app/resources/images/${i}.png`);
const stretchModes: Stretch[] = ["none", "aspectFill", "aspectFit", "fill"];
const widths = [ 75, 64, 36, 20 ];
const heights = [ 75, 64, 36, 20 ];

export function navigatingTo(args) {
    const variants: { src: string, stretch: Stretch, width: number, height: number }[] = [];

    // Better way for cartesian product?
    sources.forEach(src =>
        stretchModes.forEach(stretch =>
            widths.forEach(width =>
                heights.forEach(height =>
                    variants.push({ src, stretch, width, height })))));

    const grid: LayoutBase = args.object.getViewById("root");
    const label: Label = args.object.getViewById("label");
    let lastTap = null;
    variants.forEach(({ src, stretch, width, height}) => {
        const image = new Image();
        image.src = src;
        image.width = <any>(width + "px");
        image.height = <any>(height + "px");
        image.stretch = stretch;
        image.borderWidth = "1px";
        image.borderColor = "yellow";
        image.margin = "1px";
        (<any>image).tag = `${width} ${height} ${stretch} ${src}`;
        image.addEventListener("tap", (args: any) => {
            if (lastTap) {
                lastTap.borderColor = "yellow";
            }
            label.text = args.object.tag;
            args.object.borderColor = "red";
            lastTap = args.object;
        });
        grid.addChild(image);
    });
}