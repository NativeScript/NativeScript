import * as pages from '@nativescript/core/ui/page';
import * as fpsModule from '@nativescript/core/fps-meter';

export function createPage() {
	var startTime;
	var count = 0;
	fpsModule.addCallback(function (fps) {
		if (count < 2) {
			var stopTime = java.lang.System.nanoTime();
			console.log('Frame ' + count + ' Render time: ' + (stopTime - startTime) / 1000000);
			startTime = stopTime;
		} else {
			fpsModule.stop();
		}
		count++;
	});

	fpsModule.start();
	startTime = java.lang.System.nanoTime();

	var page = new pages.Page();

	return page;
}
//var gridLayout = new grid.GridLayout();

//var rows = 100;
//var cols = 3;

//gridLayout.columnCount = cols;
//gridLayout.rowCount = rows;

//gridLayout.orientation = 1;

//for (var col = 0; col < cols; col++) {
//    for (var row = 0; row < rows; row++) {
//        var btn = new btns.Button();
//        btn.text = "Col: " + col + ", Row: " + row;
//        grid.GridLayout.setColumn(btn, col);
//        grid.GridLayout.setRow(btn, row);
//        gridLayout.addChild(btn);
//    }
//}

//page.content = gridLayout;
//app.android.onActivityCreated = function () {
//    startTime = java.lang.System.nanoTime();
//};

//app.android.onActivityStarted = function () {
//    var stopTime = java.lang.System.nanoTime();
//    console.log("Activity onStart: " + ((stopTime - startTime) / 1000000));
//};

//export var Page = page;
