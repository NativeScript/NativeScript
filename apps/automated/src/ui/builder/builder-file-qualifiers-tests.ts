import { assertEqual, assertNull, assertThrows, assertNotNull, assert } from '../../tk-unit';
import { Button, Builder, Page, Color, _setResolver, ModuleNameResolver, PlatformContext } from '@nativescript/core';
import { navigate } from '../../ui-helper';

const testPrefix = 'bundle-file-qualifiers-tests';
let modulesToCleanup: string[] = [];
function registerTestModule(name, loader: (name: string) => void) {
	modulesToCleanup.push(name);
	global.registerModule(name, loader);
}

export function setUp() {
	_setResolver(
		new ModuleNameResolver({
			width: 640,
			height: 360,
			os: 'android',
			deviceType: 'phone',
		})
	);
}

export function tearDown() {
	modulesToCleanup.forEach(global._unregisterModule);
	modulesToCleanup = [];
	_setResolver(undefined);
}

function createViewFromEntryAndNavigate(): Page {
	const page = <Page>Builder.createViewFromEntry({
		moduleName: `${testPrefix}/test`,
	});

	navigate(() => page);

	return page;
}

function loadRightCss() {
	return `.test-class { color: green }`;
}

function loadRightXml() {
	return `
        <Page>
            <Button id="test-id" class="test-class" text="right" tap="testEvent"/>
        </Page>`;
}

let testEventCalled = false;
function loadRightJS() {
	return {
		testEvent: () => {
			testEventCalled = true;
		},
	};
}

function loadRightJS_CreatePage() {
	return {
		createPage: () => {
			const page = new Page();
			const btn = new Button();
			btn.id = 'test-id';
			btn.className = 'test-class';
			btn.text = 'right';
			btn.on('tap', () => {
				testEventCalled = true;
			});
			page.content = btn;

			return page;
		},
	};
}

function loadWrongCss(name: string) {
	throw new Error(`Loading wrong CSS module: ${name}`);
}

function loadWrongXml(name: string) {
	throw new Error(`Loading wrong XML module: ${name}`);
}

function loadWrongJS(name: string) {
	throw new Error(`Loading wrong JS module: ${name}`);
}

function assertXmlCss(btn: Button) {
	assertNotNull(btn, 'Test button not found');

	assertEqual(btn.text, 'right', 'Wrong XML loaded');

	assertNotNull(btn.style.color, 'Wrong CSS loaded');
	assertEqual(btn.style.color.hex, new Color('green').hex, 'Wrong CSS loaded');
}

function assertXmlCssJs(btn: Button) {
	assertXmlCss(btn);

	testEventCalled = false;
	btn._emit('tap');
	assert(testEventCalled, 'Wrong JS loaded');
}

export function testPageWithXmlCssJs_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadRightXml);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);
	registerTestModule(`${testPrefix}/test`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithJsCss_NoXML_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test`, loadRightJS_CreatePage);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithXmlCss_NoJS_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadRightXml);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCss(page.getViewById('test-id'));
}

export function testPageWithXmlCssJs_CssQualifier() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadRightXml);
	registerTestModule(`${testPrefix}/test.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/test.land.css`, loadRightCss);
	registerTestModule(`${testPrefix}/test`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithXmlCssJs_XmlQualifier() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadWrongXml);
	registerTestModule(`${testPrefix}/test.land.xml`, loadRightXml);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);
	registerTestModule(`${testPrefix}/test`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithXmlCssJs_JsQualifier() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadRightXml);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);
	registerTestModule(`${testPrefix}/test`, loadWrongJS);
	registerTestModule(`${testPrefix}/test.land`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithXmlCssJs_XmlCssJsQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadWrongXml);
	registerTestModule(`${testPrefix}/test.land.xml`, loadRightXml);
	registerTestModule(`${testPrefix}/test.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/test.land.css`, loadRightCss);
	registerTestModule(`${testPrefix}/test`, loadWrongJS);
	registerTestModule(`${testPrefix}/test.land`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithXmlCss_NoJS_XmlQualifier() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadWrongXml);
	registerTestModule(`${testPrefix}/test.land.xml`, loadRightXml);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCss(page.getViewById('test-id'));
}

export function testPageWithJsCss_NoXML_JsQualifier() {
	// Arrange
	registerTestModule(`${testPrefix}/test`, loadWrongJS);
	registerTestModule(`${testPrefix}/test.land`, loadRightJS_CreatePage);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

function loadPageXmlWithCssFile() {
	return `
    <Page cssFile="${testPrefix}/custom-test.css">
        <Button id="test-id" class="test-class" text="right" tap="testEvent"/>
    </Page>`;
}

export function testPageWithXmlCssJs_WithCssFile_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithCssFile);
	registerTestModule(`${testPrefix}/test.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/custom-test.css`, loadRightCss);
	registerTestModule(`${testPrefix}/test`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithXmlCssJs_WithCssFile_WithQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithCssFile);
	registerTestModule(`${testPrefix}/test.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/custom-test.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/custom-test.land.css`, loadRightCss);
	registerTestModule(`${testPrefix}/test`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

function loadPageXmlWithCodeFile() {
	return `
    <Page codeFile="${testPrefix}/custom-test.js">
        <Button id="test-id" class="test-class" text="right" tap="testEvent"/>
    </Page>`;
}

export function testPageWithXmlCssJs_WithCodeFile_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithCodeFile);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);
	registerTestModule(`${testPrefix}/custom-test`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testPageWithXmlCssJs_WithCodeFile_WithQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithCodeFile);
	registerTestModule(`${testPrefix}/test.css`, loadRightCss);
	registerTestModule(`${testPrefix}/custom-test`, loadWrongJS);
	registerTestModule(`${testPrefix}/custom-test.land`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

// --------------------------------------------------------------
// ----------------- Custom Component Tests ---------------------
// --------------------------------------------------------------

function loadPageXmlWithComponent() {
	return `
        <Page xmlns:cc="${testPrefix}/component">
            <cc:MyComponent/>
        </Page>`;
}

function loadRightComponentXml() {
	return `<Button id="test-id" class="test-class" text="right" tap="testEvent"/>`;
}

export function testCustomComponentWithXmlCssJs_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component/MyComponent.xml`, loadRightComponentXml);
	registerTestModule(`${testPrefix}/component/MyComponent.css`, loadRightCss);
	registerTestModule(`${testPrefix}/component/MyComponent`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testCustomComponentWithXmlCssJs_JsQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component/MyComponent.xml`, loadRightComponentXml);
	registerTestModule(`${testPrefix}/component/MyComponent.css`, loadRightCss);
	registerTestModule(`${testPrefix}/component/MyComponent`, loadWrongJS);
	registerTestModule(`${testPrefix}/component/MyComponent.land`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testCustomComponentWithXmlCssJs_CssQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component/MyComponent.xml`, loadRightComponentXml);
	registerTestModule(`${testPrefix}/component/MyComponent.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/component/MyComponent.land.css`, loadRightCss);
	registerTestModule(`${testPrefix}/component/MyComponent`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testCustomComponentWithXmlCssJs_XmlQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component/MyComponent.xml`, loadWrongXml);
	registerTestModule(`${testPrefix}/component/MyComponent.land.xml`, loadRightComponentXml);
	registerTestModule(`${testPrefix}/component/MyComponent.css`, loadRightCss);
	registerTestModule(`${testPrefix}/component/MyComponent`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testCustomComponentWithXmlCssJs_XmlCssJsQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component/MyComponent.xml`, loadWrongXml);
	registerTestModule(`${testPrefix}/component/MyComponent.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/component/MyComponent`, loadWrongJS);
	registerTestModule(`${testPrefix}/component/MyComponent.land.xml`, loadRightComponentXml);
	registerTestModule(`${testPrefix}/component/MyComponent.land.css`, loadRightCss);
	registerTestModule(`${testPrefix}/component/MyComponent.land`, loadRightJS);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

function loadCodeCustomComponentJS() {
	class MyComponent extends Button {
		constructor() {
			super();
			this.id = 'test-id';
			this.className = 'test-class';
			this.text = 'right';
			this.on('tap', () => {
				testEventCalled = true;
			});
		}
	}

	return { MyComponent };
}

export function testCustomComponentWithCode_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component`, loadCodeCustomComponentJS);
	registerTestModule(`${testPrefix}/component.css`, loadRightCss);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testCustomComponentWithCode_JsCssQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component`, loadWrongJS);
	registerTestModule(`${testPrefix}/component.land`, loadCodeCustomComponentJS);
	registerTestModule(`${testPrefix}/component.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/component.land.css`, loadRightCss);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

function loadRightComponentXmlWithCodeFileAndCssFile() {
	return `<Button
        codeFile="${testPrefix}/component/custom-code-component.js"
        cssFile="${testPrefix}/component/custom-code-component.css"
        id="test-id" class="test-class" text="right" tap="testEvent"/>`;
}

export function testCustomComponent_WithCodeFileAndCssFile_NoQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component/MyComponent.xml`, loadRightComponentXmlWithCodeFileAndCssFile);

	registerTestModule(`${testPrefix}/component/MyComponent.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/component/custom-code-component`, loadRightJS);
	registerTestModule(`${testPrefix}/component/custom-code-component.css`, loadRightCss);

	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}

export function testCustomComponent_WithCodeFileAndCssFile_WithQualifiers() {
	// Arrange
	registerTestModule(`${testPrefix}/test.xml`, loadPageXmlWithComponent);
	registerTestModule(`${testPrefix}/component/MyComponent.xml`, loadRightComponentXmlWithCodeFileAndCssFile);

	registerTestModule(`${testPrefix}/component/MyComponent.css`, loadWrongCss);
	registerTestModule(`${testPrefix}/component/custom-code-component`, loadWrongJS);
	registerTestModule(`${testPrefix}/component/custom-code-component.css`, loadWrongCss);

	registerTestModule(`${testPrefix}/component/custom-code-component.land`, loadRightJS);
	registerTestModule(`${testPrefix}/component/custom-code-component.land.css`, loadRightCss);
	// Act
	const page = createViewFromEntryAndNavigate();

	// Assert
	assertXmlCssJs(page.getViewById('test-id'));
}
