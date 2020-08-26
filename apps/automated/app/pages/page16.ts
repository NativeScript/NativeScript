import * as pageModule from '@nativescript/core/ui/page';
import * as buttonModule from '@nativescript/core/ui/button';
import * as stackModule from '@nativescript/core/ui/layouts/stack-layout';
import { Frame } from '@nativescript/core/ui/frame';

export function createPage() {
	var page = new pageModule.Page();

	//var iconItem = new pageModule.MenuItem();
	//iconItem.text = "TEST";

	//iconItem.icon = "~/app" + "/tests" + "/test-icon.png"; // use + to stop regex replace during build
	//iconItem.on("tap", () => {
	//    console.log("Icon item tapped");
	//});
	//page.optionsMenu.addItem(iconItem);

	//var textItem = new pageModule.MenuItem();
	//textItem.text = "SAVE";
	//textItem.on("tap", () => {
	//    console.log("Save item tapped");
	//});
	//page.optionsMenu.addItem(textItem);

	var stackLayout = new stackModule.StackLayout();
	//var count = 0;
	var btn1 = new buttonModule.Button();
	btn1.text = 'add item';
	//btn1.on("tap", () => {
	//    console.log("adding menu item");

	//    var newItem = new pageModule.MenuItem();
	//    var text =  "item " + count;
	//    newItem.text = text
	//    newItem.on("tap", () => {
	//        console.log("ITEM [" + text + "] tapped");
	//    });
	//    page.optionsMenu.addItem(newItem);
	//    count++;
	//});

	stackLayout.addChild(btn1);

	var btn2 = new buttonModule.Button();
	btn2.text = 'navigate';
	btn2.on('tap', () => {
		var nextPage = 'app/tests/pages/page16';
		Frame.topmost().navigate(nextPage);
	});

	stackLayout.addChild(btn2);

	page.content = stackLayout;

	return page;
}
