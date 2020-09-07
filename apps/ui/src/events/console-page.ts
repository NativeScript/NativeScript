import * as pageModule from '@nativescript/core/ui/page';
import * as labelModule from '@nativescript/core/ui/label';
import * as stackLayoutModule from '@nativescript/core/ui/layouts/stack-layout';
import * as textViewModule from '@nativescript/core/ui/text-view';
import * as buttonModule from '@nativescript/core/ui/button';

export function createPage() {
	var stackLayout = new stackLayoutModule.StackLayout();
	var label = new labelModule.Label();
	label.text = 'CONSOLE MODULE';
	var textView = new textViewModule.TextView();
	textView.text = 'Check out the console output.';
	stackLayout.addChild(label);
	stackLayout.addChild(textView);

	var page = new pageModule.Page();
	page.on(pageModule.Page.loadedEvent, function () {
		pageLoaded();
	});

	page.content = stackLayout;

	return page;
}

export function pageLoaded() {
	console.log('### TEST START ###');
	console.time('Time');

	var undef;
	var num = -1;
	var str = 'text';
	var obj = { name: 'John', age: 34 };
	var button = new buttonModule.Button();

	console.log(true);
	console.log(false);
	console.log(null);
	console.log(undef);

	console.log(num);
	console.log(str);
	console.log(obj);

	console.log(`number: ${num}`);
	console.log(`string: ${str}`);
	console.log(`${str} ${num}`);

	console.info('info');
	console.warn('warn');
	console.error('error');

	console.assert(false, `false == true`);
	console.assert(true, '1 equals 1');

	console.assert('', "empty string evalutes to 'false'");

	console.trace('console.trace() called');
	console.dir(true);
	console.dir(false);
	console.dir(null);
	console.dir(undef);

	console.dir(num);
	console.dir(str);

	console.dir(obj);
	console.log(`${button}`);

	console.log(num, str, obj);
	console.log([1, 5, 12.5, obj, str, 42]);

	console.trace();

	console.timeEnd('Time');
	console.log('### TEST END ###');
}
