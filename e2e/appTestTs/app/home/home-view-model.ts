import { ObservableProperty } from "../observable-property-decorator";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Observable } from "tns-core-modules/data/observable";

import { getData } from "./data";

export class HomeViewModel extends Observable {
    @ObservableProperty() isBusy: boolean = true;
    @ObservableProperty() dataItems: ObservableArray<any>;

    constructor() {
        super();
        this.isBusy = true;
        this.dataItems = new ObservableArray<any>();

        getData().then((doctorsData) => {
            this.dataItems.push(doctorsData);
            this.isBusy = false;
        });
    }

    onLoadMoreItems(args) {
        getData().then((doctorsData) => {
            this.dataItems.push(doctorsData);
        });
    }
}
