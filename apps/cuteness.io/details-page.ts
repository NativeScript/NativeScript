import {Page} from "ui";
import {EventData as ObservableEventData} from "data/observable";

// Event handler for Page "navigatedTo" event attached in details-page.xml
export function pageNavigatedTo(args: ObservableEventData) {
    // Get the event sender
    var page = <Page>args.object;

    page.bindingContext = page.navigationContext;
}
