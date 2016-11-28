import { ListPicker as ListPickerDefinition, ItemsSource } from "ui/list-picker";
import { View } from "ui/core/view";
import { Property } from "ui/core/properties";

export class ListPickerBase extends View implements ListPickerDefinition {

    public selectedIndex: number;
    public items: any[] | ItemsSource;

    public _getItemAsString(index: number): any {
        if (!this.items) {
            return " ";
        }

        let getItem = (<ItemsSource>this.items).getItem;
        let item = typeof getItem === "function" ? getItem(index) : this.items[index];
        return item === undefined || item === null ? index + "" : item + "";
    }

    protected getSelectedIndex(items: any[] | ItemsSource): number {
        let maxValue = items && items.length > 0 ? items.length - 1 : 0;
        let selectedIndex = this.selectedIndex;
        if (selectedIndex < 0 || selectedIndex > maxValue) {
            selectedIndex = 0;
        }

        return selectedIndex;
    }
}

export const selectedIndexProperty = new Property<ListPickerBase, number>({ name: "selectedIndex", defaultValue: -1 });
export const itemsProperty = new Property<ListPickerBase, any[] | ItemsSource>({ name: "items" });