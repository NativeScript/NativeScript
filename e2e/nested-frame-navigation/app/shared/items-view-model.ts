
import { Observable } from "tns-core-modules/data/observable";
import { Item } from "./item";

export class ItemsViewModel extends Observable {
    constructor(public items: Array<Item>) {
        super();
    }
}
