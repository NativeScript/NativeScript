import { Tabs, SelectedIndexChangedEventData } from "tns-core-modules/ui/tabs";

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
    const tabsNav = <Tabs>args.object;
    
    const newItem = tabsNav.tabStrip.items[args.newIndex];
    if (newItem) {
        newItem.iconSource = "res://icon";
    }

    const oldItem = tabsNav.tabStrip.items[args.oldIndex];
    if (oldItem) {
        oldItem.iconSource = "res://testlogo";
    }
}
