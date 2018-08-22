import { Observable } from "tns-core-modules/data/observable";

const colors = ["red", "green", "blue", "yellow"];

export function onNavigatingTo(args) {
    const page = args.object;
    const vm = new Observable();
    vm.set("myItems", colors);
    page.bindingContext = vm;
}
