import { Observable } from "tns-core-modules/data/observable";
import { EventData, Page } from "tns-core-modules/ui/page";
import { Button } from "tns-core-modules/ui/button";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new SettingsViewModel();
}

export class SettingsViewModel extends Observable {

    private _duration: number = 1;
    private _delay: number = 0;
    private _iterations: number = 1;
    private _selectedDirectionIndex: number = 0;
    private _selectedFillIndex: number = 0;

    constructor() {
        super();
    }

    get iterations() {
        return this._iterations;
    }

    set iterations(value: number) {
        if (value !== this._iterations) {
            this._iterations = this.roundSliderValue(value);
        }
    }

    get delay() {
        return this._delay;
    }

    set delay(value: number) {
        if (value !== this._delay) {
            this._delay = this.roundSliderValue(value);
        }
    }

    get duration() {
        return this._duration;
    }

    set duration(value: number) {
        if (this._duration !== value) {
            this._duration = this.roundSliderValue(value);
        }
    }

    get selectedDirectionIndex() {
        return this._selectedDirectionIndex;
    }

    set selectedDirectionIndex(value: number) {
        if (value !== this._selectedDirectionIndex) {
            this._selectedDirectionIndex = value;
        }
    }

    get selectedFillIndex() {
        return this._selectedFillIndex;
    }

    set selectedFillIndex(value: number) {
        if (value !== this._selectedDirectionIndex) {
            this._selectedFillIndex = value;
        }
    }

    public onAnimate(args: EventData) {
        const button = <Button>args.object;

        let css = `
        Label {
            font-size: 8;
        }
        #img {
            animation-name: transformed;
            animation-duration: ${this.duration};
            animation-delay: ${this.delay};
            animation-iteration-count: ${this.iterations};
            animation-direction:${this.selectedDirectionIndex === 1 ? "reverse" : "normal"};
            animation-fill-mode: ${this.selectedFillIndex === 1 ? "forwards" : "none"};
        }`;

        button.page.css = css;
    }

    private roundSliderValue(value: number) {
        return Math.round(value);
    }
}