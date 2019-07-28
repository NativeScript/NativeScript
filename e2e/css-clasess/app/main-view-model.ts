import { Observable } from "tns-core-modules/data/observable";

export class HelloWorldModel extends Observable {

    private _counter: number;
    private _message: string;

    constructor() {
        super();

        // Initialize default values.
        this._counter = 13;
        this.updateMessage();
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange("message", value);
        }
    }

    // onTap() {
    //     this._counter--;
    //     this.updateMessage();
    // }

    private updateMessage() {
        if (this._counter <= 0) {
            this.message = "Hoorraaay!";
        } else {
            this.message = `${this._counter} taps left`;
        }
    }
}
