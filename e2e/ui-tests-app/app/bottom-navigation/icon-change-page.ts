import { BottomNavigation, SelectedIndexChangedEventData } from "tns-core-modules/ui/bottom-navigation";

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
    const bottomNav = <BottomNavigation>args.object;
    
    const newItem = bottomNav.tabStrip.items[args.newIndex];
    if (newItem) {
        newItem.iconSource = "res://icon";
    }

    const oldItem = bottomNav.tabStrip.items[args.oldIndex];
    if (oldItem) {
        oldItem.iconSource = "res://testlogo";
    }
}
