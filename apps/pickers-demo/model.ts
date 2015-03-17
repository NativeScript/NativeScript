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

    private _day: number;
    get day(): number {
        return this._day;
    }
    set day(value: number) {
        console.log("day:" + value);
        this._day = value;
        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "day", value: value });
    }

    private _month: number;
    get month(): number {
        return this._month;
    }
    set month(value: number) {
        console.log("month:" + value);
        this._month = value;
        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "month", value: value });
    }
    
    private _year: number;
    get year(): number {
        return this._year;
    }
    set year(value: number) {
        console.log("year:" + value);
        this._year = value;
        this.notify({ object: this, eventName: observable.knownEvents.propertyChange, propertyName: "year", value: value });
    }
}