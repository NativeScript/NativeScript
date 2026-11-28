// >> connectivity-require
import * as connectivity from '@nativescript/core/connectivity';
// << connectivity-require

export const test_DummyTestForSnippetOnly0 = function () {
	// >> connectivity-type
	const connectionType = connectivity.getConnectionType();
	switch (connectionType) {
		case connectivity.connectionType.none:
			//console.log("No connection");
			break;
		case connectivity.connectionType.wifi:
			//console.log("WiFi connection");
			break;
		case connectivity.connectionType.mobile:
			//console.log("Mobile connection");
			break;
	}
	// << connectivity-type
};

export const test_DummyTestForSnippetOnly1 = function () {
	// >> connectivity-monitoring
	connectivity.startMonitoring(function onConnectionTypeChanged(newConnectionType: number) {
		switch (newConnectionType) {
			case connectivity.connectionType.none:
				//console.log("Connection type changed to none.");
				break;
			case connectivity.connectionType.wifi:
				//console.log("Connection type changed to WiFi.");
				break;
			case connectivity.connectionType.mobile:
				//console.log("Connection type changed to mobile.");
				break;
		}
	});
	//...
	connectivity.stopMonitoring();
	// << connectivity-monitoring
};
