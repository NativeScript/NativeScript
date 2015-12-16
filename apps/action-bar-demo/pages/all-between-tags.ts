import observable = require("data/observable");

export function onTapped(args: observable.EventData) {
    console.log(`Tapped ${(<any>args.object).text}`);
}
