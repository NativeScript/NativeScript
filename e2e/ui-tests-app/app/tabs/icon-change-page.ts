import { BottomNavigation, SelectedIndexChangedEventData } from "tns-core-modules/ui/bottom-navigation";

export function onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
    const bottomNav = args.object as BottomNavigation;
    
    const newItem = bottomNav.tabStrip.items[args.newIndex];
    if (newItem) {
        newItem.iconSource = "res://icon";
    }

    const oldItem = bottomNav.tabStrip.items[args.oldIndex];
    if (oldItem) {
        oldItem.iconSource = "res://testlogo";
    }
}
