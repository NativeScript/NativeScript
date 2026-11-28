import * as buttonModule from '@nativescript/core/ui/button';
import * as pageModule from '@nativescript/core/ui/page';
import * as textFieldModule from '@nativescript/core/ui/text-field';
import * as stackLayoutModule from '@nativescript/core/ui/layouts/stack-layout';
import * as observableModule from '@nativescript/core/data/observable';

export function createPage() {
	const page = new pageModule.Page();
	const stack = new stackLayoutModule.StackLayout();
	const sourceOneWay = new observableModule.Observable();
	const sourceTwoWay = new observableModule.Observable();
	const targetOneWay = new textFieldModule.TextField();
	const targetTwoWay = new textFieldModule.TextField();
	const buttonOneWay = new buttonModule.Button();
	const buttonTwoWay = new buttonModule.Button();
	const buttonSetText = new buttonModule.Button();

	targetOneWay.id = 'textFieldOneWay';
	targetTwoWay.id = 'textFieldTwoWay';
	buttonOneWay.id = 'buttonOneWay';
	buttonTwoWay.id = 'buttonTwoWay';
	buttonSetText.id = 'buttonSetText';

	targetOneWay.automationText = 'textFieldOneWay';
	targetTwoWay.automationText = 'textFieldTwoWay';
	buttonSetText.automationText = 'buttonSetText';
	//buttonOneWay.automationText = "buttonOneWay";
	//buttonTwoWay.automationText = "buttonTwoWay";

	buttonSetText.text = 'SetText';
	buttonSetText.on(buttonModule.Button.tapEvent, function () {
		targetOneWay.text = 'Test';
		targetTwoWay.text = 'Test';
	});
	stack.addChild(buttonSetText);

	// OneWay Binding
	const bindingOptionOneWay = {
		sourceProperty: 'textSource',
		targetProperty: 'text',
		twoWay: false,
	};

	targetOneWay.bind(bindingOptionOneWay, sourceOneWay);
	sourceOneWay.set('textSource', 'OneWay');

	buttonOneWay.on(buttonModule.Button.loadedEvent, function () {
		buttonOneWay.text = sourceOneWay.get('textSource');
	});
	buttonOneWay.on(buttonModule.Button.tapEvent, function () {
		buttonOneWay.text = sourceOneWay.get('textSource');
	});

	stack.addChild(targetOneWay);
	stack.addChild(buttonOneWay);

	// TwoWay Binding
	const bindingOptionTwoWay = {
		sourceProperty: 'textSource',
		targetProperty: 'text',
		twoWay: true,
	};

	targetTwoWay.bind(bindingOptionTwoWay, sourceTwoWay);
	sourceTwoWay.set('textSource', 'TwoWay');

	buttonTwoWay.on(buttonModule.Button.loadedEvent, function () {
		buttonTwoWay.text = sourceTwoWay.get('textSource');
	});
	buttonTwoWay.on(buttonModule.Button.tapEvent, function () {
		buttonTwoWay.text = sourceTwoWay.get('textSource');
	});

	stack.addChild(targetTwoWay);
	stack.addChild(buttonTwoWay);

	page.content = stack;

	return page;
}
