import { ShownModallyData } from "tns-core-modules/ui/core/view";

export function onShowingModally(args: ShownModallyData) {
    console.log("modal tabview showingModally");
}

export function onShownModally(args: ShownModallyData) {
    console.log("modal tabview shownModally");
}