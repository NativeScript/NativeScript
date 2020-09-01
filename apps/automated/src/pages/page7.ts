import * as pages from '@nativescript/core/ui/page';
import * as buttons from '@nativescript/core/ui/button';
import { VerticalAlignment } from '@nativescript/core';

export function createPage() {
	var page = new pages.Page();

	var btn = new buttons.Button();
	btn.width = 200;
	btn.height = 60;
	btn.text = 'test';

	var vAligns: VerticalAlignment[] = ['stretch', 'top', 'middle', 'bottom'];
	//var hAligns = ["stretch", "left", "center", "right"];
	var count = 0;
	btn.on(buttons.Button.tapEvent, function () {
		//page.css = "button { vertical-align:" + vAligns[(count++) % 4] + " }";
		btn.verticalAlignment = vAligns[count++ % 4];
	});

	//export function performanceTest() {
	//        var testBtn = new buttons.Button();
	//        var i = 0;
	//        var tmp;
	//        var start;
	//        var end;

	//        start = new Date().getTime();
	//        for (i = 0; i < 1000000; i++) {
	//            tmp = testBtn.verticalAlignment;
	//        }
	//        end = new Date().getTime();
	//        console.log("GET from STYLE time: " + (end - start));

	//        start = new Date().getTime();
	//        for (i = 0; i < 1000000; i++) {
	//            tmp = testBtn.horizontalAlignment;
	//        }
	//        end = new Date().getTime();
	//        console.log("GET from LayoutInfo time: " + (end - start));

	//        start = new Date().getTime();
	//        for (i = 0; i < 1000000; i++) {
	//            testBtn.verticalAlignment = vAligns[i % 4];
	//        }
	//        end = new Date().getTime();
	//        console.log("SET to STYLE time: " + (end - start));

	//        start = new Date().getTime();
	//        for (i = 0; i < 1000000; i++) {
	//            testBtn.horizontalAlignment = hAligns[i % 4];
	//        }
	//        end = new Date().getTime();
	//        console.log("SET from LayoutInfo time: " + (end - start));
	//    }

	page.content = btn;

	return page;
}
//export var Page = page;
