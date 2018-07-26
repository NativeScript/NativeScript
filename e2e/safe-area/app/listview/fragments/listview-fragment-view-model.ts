import { Observable } from "data/observable";

export class ListViewViewModel extends Observable {
    items: Array<any>;

    constructor() {
        super();

        this.items = [];

        for (let i = 0; i < 50; i++) {
            this.items.push({
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut scelerisque enim mi, id ultrices felis maximus vel.",
                shortText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
            });
        }
    }
}