import observable = require("data/observable");
import pages = require("ui/page");
import connectivity = require("connectivity");
import labelModule = require("ui/label");
import color = require("color");

var infoLabel: labelModule.Label;
export function onPageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    infoLabel = page.getViewById<labelModule.Label>("infoLabel");
}

export function onGetConnectionType(args: observable.EventData) {
    var connectionType = connectivity.getConnectionType();
    updateInfoLabel(connectionType);
}

export function onStartMonitoring(args: observable.EventData) {
    onGetConnectionType(null);
    connectivity.startMonitoring(onConnectionTypeChanged);
}

export function onStopMonitoring(args: observable.EventData) {
    connectivity.stopMonitoring();
}

function updateInfoLabel(connectionType: number) {
    switch (connectionType) {
        case connectivity.connectionType.none:
            infoLabel.text = "None";
            infoLabel.backgroundColor = new color.Color("Red");
            break;
        case connectivity.connectionType.wifi:
            infoLabel.text = "WiFi";
            infoLabel.backgroundColor = new color.Color("Green");
            break;
        case connectivity.connectionType.mobile:
            infoLabel.text = "Mobile";
            infoLabel.backgroundColor = new color.Color("Yellow");
            break;
    }
}

function onConnectionTypeChanged(newConnectionType: number) {
    switch (newConnectionType) {
        case connectivity.connectionType.none:
            console.log("Connection type changed to none.");
            break;
        case connectivity.connectionType.wifi:
            console.log("Connection type changed to WiFi.");
            break;
        case connectivity.connectionType.mobile:
            console.log("Connection type changed to mobile.");
            break;
    }
    updateInfoLabel(newConnectionType);
}