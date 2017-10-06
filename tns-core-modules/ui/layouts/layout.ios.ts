import { Layout as LayoutDefinition } from "./layout";
import { LayoutBase } from "./layout-base";

export * from "./layout-base";
export class Layout extends LayoutBase implements LayoutDefinition {
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will measure the native element.
    }
}
