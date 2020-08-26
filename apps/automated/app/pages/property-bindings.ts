import * as btns from '@nativescript/core/ui/button';
import * as pages from '@nativescript/core/ui/page';
import * as stacks from '@nativescript/core/ui/layouts/stack-layout';
import * as scroll from '@nativescript/core/ui/scroll-view';
import * as textView from '@nativescript/core/ui/text-view';
import * as labels from '@nativescript/core/ui/label';
import { Trace } from '@nativescript/core';
import * as gridModule from '@nativescript/core/ui/layouts/grid-layout';
import * as sliders from '@nativescript/core/ui/slider';
import * as switches from '@nativescript/core/ui/switch';
import * as bindable from '@nativescript/core/ui/core/bindable';

Trace.enable();
//Trace.setCategories(Trace.categories.Style + " ," + Trace.categories.Binding);
Trace.setCategories(Trace.categories.Binding);

interface NumericProeprtyDescriptor {
	name: string;
	value: number;
	min: number;
	max: number;
}

interface BoolPropertyDescriptor {
	name: string;
	value: boolean;
}

interface StringPropertyDescriptor {
	name: string;
	value: string;
}

export function createPage() {
	var page = new pages.Page();
	var grid = new gridModule.GridLayout();
	grid.addRow(new gridModule.ItemSpec());
	grid.addRow(new gridModule.ItemSpec());
	page.content = grid;

	var count = 0;
	var control = new btns.Button();
	control.text = 'test control';
	control.on(btns.Button.tapEvent, (data) => {
		control.text = 'count: ' + count++;
	});
	grid.addChild(control);

	var scrollView = new scroll.ScrollView();
	gridModule.GridLayout.setRow(scrollView, 1);
	grid.addChild(scrollView);
	var stack = new stacks.StackLayout();
	scrollView.content = stack;

	function createNumericPropertyUI(desc: NumericProeprtyDescriptor) {
		var lbl = new labels.Label();
		lbl.text = desc.name;
		lbl.horizontalAlignment = 'left';
		stack.addChild(lbl);

		var slider = new sliders.Slider();
		slider.minValue = desc.min;
		slider.maxValue = desc.max;
		slider.value = desc.value;
		stack.addChild(slider);

		var options: bindable.BindingOptions = {
			sourceProperty: 'value',
			targetProperty: desc.name,
		};
		control.bind(options, slider);
	}

	function createBooleanPropertyUI(desc: BoolPropertyDescriptor) {
		var lbl = new labels.Label();
		lbl.text = desc.name;
		lbl.horizontalAlignment = 'left';
		stack.addChild(lbl);

		var sw = new switches.Switch();
		sw.checked = desc.value;
		sw.horizontalAlignment = 'left';
		stack.addChild(sw);

		var options: bindable.BindingOptions = {
			sourceProperty: 'checked',
			targetProperty: desc.name,
		};
		control.bind(options, sw);
	}

	function createStringPropertyUI(desc: StringPropertyDescriptor) {
		var lbl = new labels.Label();
		lbl.text = desc.name;
		lbl.horizontalAlignment = 'left';
		stack.addChild(lbl);

		var txt = new textView.TextView();
		txt.text = desc.value;
		stack.addChild(txt);

		var options: bindable.BindingOptions = {
			sourceProperty: 'text',
			targetProperty: desc.name,
		};
		control.bind(options, txt);
	}

	createNumericPropertyUI({ name: 'style.minWidth', value: 30, min: 10, max: 300 });
	createNumericPropertyUI({ name: 'style.width', value: 100, min: 10, max: 300 });

	createNumericPropertyUI({ name: 'style.minHeight', value: 30, min: 10, max: 300 });
	createNumericPropertyUI({ name: 'style.height', value: 100, min: 10, max: 300 });

	createBooleanPropertyUI({ name: 'isEnabled', value: true });
	createNumericPropertyUI({ name: 'style.opacity', value: 1, min: 0, max: 1 });
	createStringPropertyUI({ name: 'style.visibility', value: 'visible' });

	createStringPropertyUI({ name: 'style.horizontalAlignment', value: 'stretch' });
	createStringPropertyUI({ name: 'style.verticalAlignment', value: 'stretch' });
	createStringPropertyUI({ name: 'margin', value: '20' });

	createStringPropertyUI({ name: 'className', value: 'testClass' });

	page.css = '.testClass { background-color: LightGreen }';

	return page;
}
//export var Page = page;
