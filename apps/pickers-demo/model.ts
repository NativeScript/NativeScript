import observable = require("data/observable");

export class WebViewModel extends observable.Observable {
    constructor() {
        super();
    }

    private _selectedIndex: number;
    get selectedIndex(): number {
        return this._selectedIndex;
    }
    set selectedIndex(value: number) {
        console.log("selectedIndex:" + value);
        this._selectedIndex = value;
        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "selectedIndex", value: value });
    }
    
    private _items: Array<string> 
    get items(): Array<string> {
        return this._items;
    }
    set items(value: Array<string>) {
        console.log("items:" + value);
        this._items = value;
        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "items", value: value });
    }
}