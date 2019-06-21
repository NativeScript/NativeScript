import { ListPicker } from "tns-core-modules/ui/list-picker";
import { Page } from "tns-core-modules/ui/page";

export function loaded(args) {
    const items = [];
    for (var i = 0; i < 100; i++) {
        items.push("name" + i);
    }
    
    const target = (<Page>args.object.page).getViewById<ListPicker>("target");
    target.items = items;
    target.selectedIndex = 3;
}
