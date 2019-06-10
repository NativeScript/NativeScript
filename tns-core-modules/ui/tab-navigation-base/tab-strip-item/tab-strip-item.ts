import { TabStripItem as TabStripItemDefinition } from ".";
import { ViewBase, AddChildFromBuilder, CSSType } from "../../core/view";
import { Image } from "../../image/image";
import { Label } from "../../label/label";

export * from "../../core/view";
export const traceCategory = "TabView";

@CSSType("TabStripItem")
export class TabStripItem extends ViewBase implements TabStripItemDefinition, AddChildFromBuilder {
    public title: string;
    public iconSource: string;
    public image: Image;
    public label: Label;

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "Image") {
            this.image = <Image>value;
            this.iconSource = (<Image>value).src;
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }

        if (name === "Label") {
            this.label = <Label>value;
            this.title = (<Label>value).text;
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }
    }
}
