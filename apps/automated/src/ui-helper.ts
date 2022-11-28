import { Color, Button, FormattedString, Span, ActionBar, Builder, isIOS, unsetValue, View, ViewBase, Frame, NavigationEntry, LayoutBase, StackLayout, Page, TabView, TabViewItem, Utils } from '@nativescript/core';

import * as TKUnit from './tk-unit';

const DELTA = 0.1;

export let ASYNC = 0.2;
export let MEMORY_ASYNC = 2;

export function getColor(uiColor: UIColor): Color {
	let redRef = new interop.Reference<number>();
	let greenRef = new interop.Reference<number>();
	let blueRef = new interop.Reference<number>();
	let alphaRef = new interop.Reference<number>();

	uiColor.getRedGreenBlueAlpha(redRef, greenRef, blueRef, alphaRef);
	let red = redRef.value * 255;
	let green = greenRef.value * 255;
	let blue = blueRef.value * 255;
	let alpha = alphaRef.value * 255;

	return new Color(alpha, red, green, blue);
}

export function clearPage(): void {
	let newPage = getCurrentPage();
	if (!newPage) {
		throw new Error('NO CURRENT PAGE!!!!');
	}

	newPage.style.backgroundColor = unsetValue;
	newPage.style.color = unsetValue;
	newPage.bindingContext = unsetValue;
	newPage.className = unsetValue;
	newPage.id = unsetValue;
}

export function do_PageTest(test: (views: [Page, View, View, View, ActionBar]) => void, content: View, secondView: View, thirdView: View) {
	clearPage();
	let newPage = getCurrentPage();
	newPage.content = content;
	test([newPage, content, secondView, thirdView, newPage.actionBar]);
	newPage.content = null;
}

export function do_PageTest_WithButton(test: (views: [Page, Button, ActionBar]) => void) {
	clearPage();
	let newPage = getCurrentPage();
	let btn = new Button();
	newPage.content = btn;
	test([newPage, btn, newPage.actionBar]);
	newPage.content = null;
}

export function do_PageTest_WithStackLayout_AndButton(test: (views: [Page, StackLayout, Button, ActionBar]) => void) {
	clearPage();
	let newPage = getCurrentPage();
	let stackLayout = new StackLayout();
	let btn = new Button();
	stackLayout.addChild(btn);
	newPage.content = stackLayout;
	test([newPage, stackLayout, btn, newPage.actionBar]);
	newPage.content = null;
}

export interface PageOptions {
	pageCss?: any;
	actionBar?: boolean;
	actionBarFlat?: boolean;
	actionBarHidden?: boolean;
	tabBar?: boolean;
}

export function buildUIAndRunTest<T extends View>(controlToTest: T, testFunction: (views: [T, Page]) => void, options?: PageOptions) {
	clearPage();
	let newPage = getCurrentPage();

	let testSubject = controlToTest as View;

	if (options) {
		if (options.pageCss) {
			newPage.css = options.pageCss;
		}

		newPage.actionBarHidden = true;
		newPage.actionBar.flat = false;

		if (options.actionBar) {
			newPage.actionBarHidden = false;
			newPage.actionBar.title = 'Test ActionBar';
		}

		if (options.actionBarFlat) {
			newPage.actionBarHidden = false;
			newPage.actionBar.title = 'Test ActionBar Flat';
			newPage.actionBar.flat = true;
		}

		if (options.actionBarHidden) {
			newPage.actionBarHidden = true;
		}

		if (options.tabBar) {
			const tabView = new TabView();
			const tabEntry = new TabViewItem();
			tabEntry.title = 'Test';
			tabEntry.view = controlToTest;
			tabView.items = [tabEntry];
			testSubject = tabView;
		}
	}

	newPage.content = testSubject;

	testFunction([controlToTest, newPage]);
	newPage.content = null;
	newPage.css = null;
}

export function buildUIWithWeakRefAndInteract<T extends View>(createFunc: () => T, interactWithViewFunc?: (view: T) => void, done?) {
	clearPage();
	const page = getCurrentPage();
	const weakRef = new WeakRef(createFunc());
	page.content = weakRef.get();
	if (interactWithViewFunc) {
		interactWithViewFunc(weakRef.get());
	}
	page.content = null;
	// Give a change for native cleanup (e.g. keyboard close, etc.).
	TKUnit.wait(0.001);
	if (page.ios) {
		/* tslint:disable:no-unused-expression */
		// Could cause GC on the next call.
		// NOTE: Don't replace this with forceGC();
		new ArrayBuffer(4 * 1024 * 1024);

		// An additional GC and wait are needed since WebKit upgrade to version 12.0
		// (TEXT-FIELD.testMemoryLeak test started failing sporadically)
		Utils.GC();
		TKUnit.wait(0.2);
	}
	Utils.GC();
	try {
		TKUnit.assert(!weakRef.get(), weakRef.get() + ' leaked!');
		done(null);
	} catch (ex) {
		done(ex);
	}
}

export function navigateToModuleAndRunTest(moduleName, context, testFunction) {
	let page = navigateToModule(moduleName, context);
	testFunction(page);
}

export function navigate(pageFactory: () => Page, navigationContext?: any): Page {
	let entry: NavigationEntry = { create: pageFactory, animated: false, context: navigationContext, clearHistory: true };

	return navigateWithEntry(entry);
}

export function navigateWithHistory(pageFactory: () => Page, navigationContext?: any): Page {
	let entry: NavigationEntry = { create: pageFactory, animated: false, context: navigationContext, clearHistory: false };

	return navigateWithEntry(entry);
}

export function navigateToModule(moduleName: string, context?: any): Page {
	let entry: NavigationEntry = { moduleName: moduleName, context: context, animated: false, clearHistory: true };

	return navigateWithEntry(entry);
}

export function getCurrentPage(): Page {
	return Frame.topmost().currentPage;
}

export function getClearCurrentPage(): Page {
	let page = Frame.topmost().currentPage;
	page.style.backgroundColor = unsetValue;
	page.style.color = unsetValue;
	page.bindingContext = unsetValue;
	page.className = unsetValue;
	page.id = unsetValue;
	page.css = '';

	return page;
}

export function waitUntilNavigatedTo(page: Page, action: Function) {
	let completed = false;
	function navigatedTo(args) {
		args.object.page.off('navigatedTo', navigatedTo);
		completed = true;
	}

	page.on('navigatedTo', navigatedTo);
	action();
	TKUnit.waitUntilReady(() => completed, 5);
}

export function waitUntilNavigatedFrom(action: Function, topFrame?: Frame) {
	const currentPage = topFrame ? topFrame.currentPage : Frame.topmost().currentPage;
	let completed = false;
	function navigatedFrom(args) {
		args.object.page.off('navigatedFrom', navigatedFrom);
		completed = true;
	}

	currentPage.on('navigatedFrom', navigatedFrom);
	action();
	TKUnit.waitUntilReady(() => completed);
}

export function waitUntilLayoutReady(view: View): void {
	TKUnit.waitUntilReady(() => view.isLayoutValid);
}

export function navigateWithEntry(entry: NavigationEntry, topFrame?: Frame): Page {
	const page = Builder.createViewFromEntry(entry) as Page;
	entry.moduleName = null;
	entry.create = function () {
		return page;
	};

	waitUntilNavigatedFrom(() => (topFrame ? topFrame.navigate(entry) : Frame.topmost().navigate(entry)));

	return page;
}

export function goBack(topFrame?: Frame) {
	waitUntilNavigatedFrom(() => (topFrame ? topFrame.goBack() : Frame.topmost().goBack()));
}

export function assertAreClose(actual: number, expected: number, message: string): void {
	const density = Utils.layout.getDisplayDensity();
	const delta = Math.floor(density) !== density ? 1.1 : DELTA;

	TKUnit.assertAreClose(actual, expected, delta, message);
}

export function assertViewColor(testView: View, hexColor: string) {
	TKUnit.assert(testView.style.color, 'Color property not applied correctly. Style value is not defined.');
	TKUnit.assertEqual(testView.style.color.hex, hexColor, 'color property');
}

export function assertViewBackgroundColor(testView: ViewBase, hexColor: string) {
	TKUnit.assert(testView.style.backgroundColor, 'Background color property not applied correctly. Style value is not defined.');
	TKUnit.assertEqual(testView.style.backgroundColor.hex, hexColor, 'backgroundColor property');
}

export function assertTabSelectedTabTextColor(testView: ViewBase, hexColor: string) {
	TKUnit.assert(testView.style.selectedTabTextColor, 'selectedTabTextColor property not applied correctly. Style value is not defined.');
	TKUnit.assertEqual(testView.style.selectedTabTextColor.hex, hexColor, 'selectedTabTextColor property not applied correctly');
}

export function forceGC() {
	if (isIOS) {
		/* tslint:disable:no-unused-expression */
		// Could cause GC on the next call.
		new ArrayBuffer(4 * 1024 * 1024);
	}

	Utils.GC();
	TKUnit.wait(0.001);
}

export function _generateFormattedString(): FormattedString {
	let formattedString = new FormattedString();
	let span: Span;

	span = new Span();
	span.fontFamily = 'serif';
	span.fontSize = 10;
	span.fontWeight = 'bold';
	span.color = new Color('red');
	span.backgroundColor = new Color('blue');
	span.textDecoration = 'line-through';
	span.text = 'Formatted';
	formattedString.spans.push(span);

	span = new Span();
	span.fontFamily = 'sans-serif';
	span.fontSize = 20;
	span.fontStyle = 'italic';
	span.color = new Color('green');
	span.backgroundColor = new Color('yellow');
	span.textDecoration = 'underline';
	span.text = 'Text';
	formattedString.spans.push(span);

	return formattedString;
}

export function nativeView_recycling_test(createNew: () => View, createLayout?: () => LayoutBase, nativeGetters?: Map<string, (view) => any>, customSetters?: Map<string, any>) {
	return;

	// if (isIOS) {
	//     // recycling not implemented yet.
	//     return;
	// }

	// setupSetters();
	// const page = getClearCurrentPage();
	// let layout: LayoutBase = new FlexboxLayout();
	// if (createLayout) {
	//     // This is done on purpose. We need the constructor of Flexbox
	//     // to run otherwise some module fileds stays uninitialized.
	//     layout = createLayout();
	// }

	// page.content = layout;

	// const first = createNew();
	// const test = createNew();

	// // Make sure we are not reusing a native views.
	// first.recycleNativeView = "never";
	// test.recycleNativeView = "never";

	// page.content = layout;

	// layout.addChild(test);

	// setValue(test.style, cssSetters);
	// setValue(test, setters, customSetters);
	// // Needed so we can reset formattedText
	// test["secure"] = false;

	// const nativeView = test.nativeViewProtected;
	// // Mark so we reuse the native views.
	// test.recycleNativeView = "always";
	// layout.removeChild(test);
	// const newer = createNew();
	// newer.recycleNativeView = "always";
	// layout.addChild(newer);
	// layout.addChild(first);

	// if (first.typeName !== "SearchBar") {
	//     // There are way too many differences in native methods for search-bar.
	//     // There are too many methods that just throw for newly created views in API lvl 19 and 17
	//     if (sdkVersion < 21) {
	//         TKUnit.waitUntilReady(() => layout.isLayoutValid);
	//     }

	//     compareUsingReflection(newer, first);
	// }

	// TKUnit.assertEqual(newer.nativeViewProtected, nativeView, "nativeView not reused.");
	// checkDefaults(newer, first, props, nativeGetters || defaultNativeGetters);
	// checkDefaults(newer, first, styleProps, nativeGetters || defaultNativeGetters);

	// layout.removeChild(newer);
	// layout.removeChild(first);
}

// function compareUsingReflection(recycledNativeView: View, newNativeView: View): void {
//     const recycled: android.view.View = recycledNativeView.nativeViewProtected;
//     const newer: android.view.View = newNativeView.nativeViewProtected;
//     TKUnit.assertNotEqual(recycled, newer);
//     const methods = newer.getClass().getMethods();
//     for (let i = 0, length = methods.length; i < length; i++) {
//         const method = methods[i];
//         const returnType = method.getReturnType();
//         const name = method.getName();
//         const skip = name.includes("ViewId")
//             || name.includes("Accessibility")
//             || name.includes("hashCode")
//             || name === "getId"
//             || name === "hasFocus"
//             || name === "isDirty"
//             || name === "getLeft"
//             || name === "getTop"
//             || name === "getRight"
//             || name === "getBottom"
//             || name === "getWidth"
//             || name === "getHeight"
//             || name === "getX"
//             || name === "getY"
//             || name.includes("getMeasured")
//             || name === "toString";

//         if (skip || method.getParameterTypes().length > 0) {
//             continue;
//         }

//         if ((<any>java).lang.Comparable.class.isAssignableFrom(returnType)) {
//             const defValue = method.invoke(newer, null);
//             const currValue = method.invoke(recycled, null);
//             if (defValue !== currValue && defValue.compareTo(currValue) !== 0) {
//                 throw new Error(`Actual: ${currValue}, Expected: ${defValue}, for method: ${method.getName()}`);
//             }
//         } else if (java.lang.String.class === returnType ||
//             java.lang.Character.class === returnType ||
//             (<any>java).lang.CharSequence.class === returnType ||
//             returnType === java.lang.Byte.TYPE ||
//             returnType === java.lang.Double.TYPE ||
//             returnType === java.lang.Float.TYPE ||
//             returnType === java.lang.Integer.TYPE ||
//             returnType === java.lang.Long.TYPE ||
//             returnType === java.lang.Short.TYPE ||
//             returnType === java.lang.Boolean.TYPE) {

//             const defValue = method.invoke(newer, null);
//             const currValue = method.invoke(recycled, null);
//             if ((currValue + "") !== (defValue + "")) {
//                 throw new Error(`Actual: ${currValue}, Expected: ${defValue}, for method: ${method.getName()}`);
//             }
//         }
//     }
// }

// function checkDefaults(newer: View, first: View, props: Array<any>, nativeGetters: Map<string, (view) => any>): void {
//     props.forEach(prop => {
//         const name = (<any>prop).name;
//         if (nativeGetters.has(name)) {
//             const getter = nativeGetters.get(name);
//             TKUnit.assertDeepEqual(getter(newer), getter(first), name);
//         } else if (newer[prop.getDefault]) {
//             TKUnit.assertDeepEqual(newer[prop.getDefault](), first[prop.getDefault](), name);
//         } else if (newer[prop.setNative]) {
//             console.log(`Type: ${newer.typeName} has no getter for ${name} property.`)
//         }
//     });
// }

// function setValue(object: Object, setters: Map<string, any>, customSetters?: Map<string, any>): void {
//     setters.forEach((value1, key) => {
//         let value = customSetters && customSetters.has(key) ? customSetters.get(key) : value1;
//         const currentValue = object[key];
//         if (currentValue === value) {
//             if (value === "horizontal" && key === "orientation") {
//                 // wrap-layout.orientation default value is 'horizontal'
//                 value = "vertical";
//             } else if (value === 2) {
//                 value = 3;
//             }
//         }

//         object[key] = value;
//         const newValue = object[key];
//         TKUnit.assertNotEqual(newValue, currentValue, `${object} setting ${key} should change current value.`);
//     });
// }

// function setupSetters(): void {
//     if (setters) {
//         return;
//     }

//     setters = new Map<string, any>();
//     // view-base
//     setters.set("id", "someId");
//     setters.set("className", "someClassName");
//     setters.set("bindingContext", "someBindingContext");

//     // view
//     setters.set("automationText", "automationText");
//     setters.set("originX", 0.2);
//     setters.set("originY", 0.2);
//     setters.set("isEnabled", false);
//     setters.set("isUserInteractionEnabled", false);

//     // action-bar
//     setters.set("title", "title");
//     setters.set("text", "text");
//     setters.set("icon", "~/logo.png");
//     setters.set("visibility", "collapse");

//     // activity-indicator
//     setters.set("busy", true);

//     // date-picker
//     setters.set("year", "2010");
//     setters.set("month", "2");
//     setters.set("day", "2");
//     setters.set("maxDate", "2100");
//     setters.set("minDate", "2000");
//     setters.set("date", new Date(2011, 3, 3));

//     // editable-text
//     setters.set("keyboardType", "datetime");
//     setters.set("returnKeyType", "done");
//     setters.set("editable", false);
//     setters.set("updateTextTrigger", "focusLost");
//     setters.set("autocapitalizationType", "words");
//     setters.set("autocorrect", true);
//     setters.set("hint", "hint");
//     setters.set("maxLength", "10");

//     // html-view
//     setters.set("html", "<a></a>");

//     // image-view
//     setters.set("imageSource", "");
//     setters.set("src", "");
//     setters.set("loadMode", "async");
//     setters.set("isLoading", true);
//     setters.set("stretch", "none");

//     // layout-base
//     setters.set("clipToBounds", false);

//     // absolute-layout
//     setters.set("left", "20");
//     setters.set("top", "20");

//     // dock-layout
//     setters.set("dock", "top");
//     setters.set("stretchLastChild", false);

//     // grid-layout props
//     setters.set("row", "1");
//     setters.set("rowSpan", "2");
//     setters.set("col", "1");
//     setters.set("colSpan", "2");

//     // stack-layout
//     setters.set("orientation", "horizontal");

//     // wrap-layout
//     // custom orientation value
//     // setters.set('orientation', 'vertical');
//     setters.set("itemWidth", "50");
//     setters.set("itemHeight", "50");

//     // list-picker
//     setters.set("items", ["1", "2", "3"]);
//     setters.set("selectedIndex", "1");

//     // list-view
//     setters.set("items", ["1", "2", "3"]);
//     setters.set("itemTemplate", "<Label text=\"{{ $value }}\" />");
//     setters.set("itemTemplates", "<template key=\"green\"><Label text=\"{{ $value }}\" style.backgroundColor=\"green\" /></template><template key=\"red\"><Label text=\"{{ $value }}\" style.backgroundColor=\"red\" /></template>");
//     setters.set("rowHeight", "50");

//     // page
//     setters.set("actionBarHidden", "true");
//     setters.set("backgroundSpanUnderStatusBar", "true");
//     setters.set("enableSwipeBackNavigation", "false");

//     // progress
//     setters.set("value", "1");
//     setters.set("maxValue", "99");

//     // repeater
//     setters.set("items", ["1", "2", "3"]);
//     setters.set("itemTemplate", "<Label text=\"{{ $value }}\" />");
//     setters.set("itemsLayout", new StackLayout());
//     setters.set("rowHeight", "50");

//     // scroll-view
//     // custom orientation value
//     //setters.set('orientation', 'horizontal');

//     // search-bar
//     setters.set("textFieldHintColor", "red");
//     setters.set("textFieldBackgroundColor", "red");

//     // segmented-bar
//     // custom items property

//     // slider
//     setters.set("minValue", "5");

//     // switch
//     setters.set("checked", "true");

//     // tab-view
//     // custom items property
//     setters.set("androidOffscreenTabLimit", "2");

//     // text-base
//     const formattedText = new FormattedString();
//     const span = new Span();
//     span.text = "span";
//     formattedText.spans.push(span);
//     setters.set("formattedText", formattedText);

//     // text-base
//     setters.set("secure", "true");

//     // time-picker
//     setters.set("minHour", 1);
//     setters.set("hour", 2);
//     setters.set("maxHour", 11);
//     setters.set("minMinute", 1);
//     setters.set("minute", 2);
//     setters.set("maxMinute", 11);
//     setters.set("minuteInterval", 2);
//     setters.set("time", new Date(2011, 2, 2, 3, 3, 3));

//     cssSetters = new Map<string, any>();

//     // style
//     cssSetters.set("rotate", "90");
//     cssSetters.set("scaleX", 2);
//     cssSetters.set("scaleY", 2);
//     cssSetters.set("translateX", 20);
//     cssSetters.set("translateY", 20);

//     cssSetters.set("clipPath", "inset(100px 50px)");
//     cssSetters.set("color", "red");
//     cssSetters.set("tintColor", "green");
//     cssSetters.set("placeholderColor", "green");

//     cssSetters.set("backgroundColor", "red");
//     cssSetters.set("backgroundImage", "~/logo.png");
//     cssSetters.set("backgroundRepeat", "repeat");
//     cssSetters.set("backgroundSize", "60px 120px");
//     cssSetters.set("backgroundPosition", "center");
//     cssSetters.set("borderColor", "blue");
//     cssSetters.set("borderTopColor", "green");
//     cssSetters.set("borderRightColor", "green");
//     cssSetters.set("borderBottomColor", "green");
//     cssSetters.set("borderLeftColor", "green");
//     cssSetters.set("borderWidth", "10px");
//     cssSetters.set("borderTopWidth", "5px");
//     cssSetters.set("borderRightWidth", "5px");
//     cssSetters.set("borderBottomWidth", "5px");
//     cssSetters.set("borderLeftWidth", "5px");
//     cssSetters.set("borderRadius", "10px");
//     cssSetters.set("borderTopLeftRadius", "5px");
//     cssSetters.set("borderTopRightRadius", "5px");
//     cssSetters.set("borderBottomRightRadius", "5px");
//     cssSetters.set("borderBottomLeftRadius", "5px");

//     cssSetters.set("fontSize", "20");
//     cssSetters.set("fontFamily", "monospace");
//     cssSetters.set("fontStyle", "italic");
//     cssSetters.set("fontWeight", "100");
//     cssSetters.set("font", "italic 2 \"Open Sans\", sans-serif");

//     // zIndex on android is not what you think...
//     // cssSetters.set('zIndex', '2');
//     cssSetters.set("opacity", "0.5");
//     // already set through view properties.
//     // cssSetters.set('visibility', 'collapse');

//     cssSetters.set("letterSpacing", "2");
//     cssSetters.set("textAlignment", "center");
//     cssSetters.set("textDecoration", "underline");
//     cssSetters.set("textTransform", "capitalize");
//     cssSetters.set("whiteSpace", "normal");

//     cssSetters.set("minWidth", 50);
//     cssSetters.set("minHeight", 50);
//     cssSetters.set("width", 100);
//     cssSetters.set("height", 100);
//     cssSetters.set("margin", "25");
//     cssSetters.set("marginLeft", "30px");
//     cssSetters.set("marginTop", "30px");
//     cssSetters.set("marginRight", "30px");
//     cssSetters.set("marginBottom", "30px");
//     cssSetters.set("padding", "25");
//     cssSetters.set("paddingLeft", "30px");
//     cssSetters.set("paddingTop", "30px");
//     cssSetters.set("paddingRight", "30px");
//     cssSetters.set("paddingBottom", "30px");
//     cssSetters.set("horizontalAlignment", "center");
//     cssSetters.set("verticalAlignment", "center");

//     cssSetters.set("transform", "translate(5, 10), scale(1.2, 1.2), rotate(45)");

//     // TabView-specific props
//     cssSetters.set("tabTextColor", "red");
//     cssSetters.set("tabBackgroundColor", "red");
//     cssSetters.set("selectedTabTextColor", "red");
//     cssSetters.set("androidSelectedTabHighlightColor", "red");

//     // ListView-specific props
//     cssSetters.set("separatorColor", "red");

//     // SegmentedBar-specific props
//     cssSetters.set("selectedBackgroundColor", "red");

//     // Page-specific props
//     cssSetters.set("statusBarStyle", "light");
//     cssSetters.set("androidStatusBarBackground", "red");

//     // Flexbox-layout props
//     cssSetters.set("flexDirection", "column");
//     cssSetters.set("flexWrap", "wrap");
//     cssSetters.set("justifyContent", "center");
//     cssSetters.set("alignItems", "center");
//     cssSetters.set("alignContent", "center");
//     cssSetters.set("order", "2");
//     cssSetters.set("flexGrow", "1");
//     cssSetters.set("flexShrink", "0");
//     cssSetters.set("flexWrapBefore", "true");
//     cssSetters.set("alignSelf", "center");
//     cssSetters.set("flexFlow", "row-reverse wrap");
//     cssSetters.set("flex", "2 0.2");

//     const nativeGetters = defaultNativeGetters = new Map<string, (view) => any>();

//     nativeGetters.set("marginLeft", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof android.view.ViewGroup.MarginLayoutParams) ? lp.leftMargin : 0;
//     });

//     nativeGetters.set("marginTop", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof android.view.ViewGroup.MarginLayoutParams) ? lp.topMargin : 0;
//     });

//     nativeGetters.set("marginRight", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof android.view.ViewGroup.MarginLayoutParams) ? lp.rightMargin : 0;
//     });

//     nativeGetters.set("marginBottom", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof android.view.ViewGroup.MarginLayoutParams) ? lp.bottomMargin : 0;
//     });

//     nativeGetters.set("col", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.CommonLayoutParams) ? lp.column : 0;
//     });

//     nativeGetters.set("colSpan", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.CommonLayoutParams) ? lp.columnSpan : 1;
//     });

//     nativeGetters.set("row", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.CommonLayoutParams) ? lp.column : 0;
//     });

//     nativeGetters.set("rowSpan", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.CommonLayoutParams) ? lp.columnSpan : 1;
//     });

//     nativeGetters.set("width", (v: { nativeView: android.view.View }) => {
//         const native = v.nativeView;
//         if (native.getParent() instanceof org.nativescript.widgets.FlexboxLayout) {
//             return -2;
//         }
//         return native.getLayoutParams().width;
//     });
//     nativeGetters.set("height", (v: { nativeView: android.view.View }) => {
//         const native = v.nativeView;
//         if (native.getParent() instanceof org.nativescript.widgets.FlexboxLayout) {
//             return -2;
//         }
//         return native.getLayoutParams().height;
//     });

//     nativeGetters.set("paddingLeft", (v: { nativeView: android.view.View }) => v.nativeView.getPaddingLeft());
//     nativeGetters.set("paddingTop", (v: { nativeView: android.view.View }) => v.nativeView.getPaddingTop());
//     nativeGetters.set("paddingRight", (v: { nativeView: android.view.View }) => v.nativeView.getPaddingRight());
//     nativeGetters.set("paddingBottom", (v: { nativeView: android.view.View }) => v.nativeView.getPaddingBottom());

//     nativeGetters.set("minWidth", (v: { nativeView: android.view.View }) => v.nativeView.getMinimumWidth());
//     nativeGetters.set("minHeight", (v: { nativeView: android.view.View }) => v.nativeView.getMinimumHeight());

//     nativeGetters.set("scaleX", (v: { nativeView: android.view.View }) => v.nativeView.getScaleX());
//     nativeGetters.set("scaleY", (v: { nativeView: android.view.View }) => v.nativeView.getScaleY());
//     nativeGetters.set("translateX", (v: { nativeView: android.view.View }) => v.nativeView.getTranslationX());
//     nativeGetters.set("translateY", (v: { nativeView: android.view.View }) => v.nativeView.getTranslationY());
//     nativeGetters.set("isEnabled", (v: { nativeView: android.view.View }) => v.nativeView.isEnabled());
//     nativeGetters.set("rotate", (v: { nativeView: android.view.View }) => v.nativeView.getRotation());

//     nativeGetters.set("order", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) ? lp.order : 1;
//     });

//     nativeGetters.set("flexGrow", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) ? lp.flexGrow : 0;
//     });

//     nativeGetters.set("flexShrink", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) ? lp.flexShrink : 1;
//     });

//     nativeGetters.set("flexWrapBefore", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) ? lp.wrapBefore : false;
//     });

//     nativeGetters.set("alignSelf", (v: { nativeView: android.view.View }) => {
//         const lp = v.nativeView.getLayoutParams();
//         return (lp instanceof org.nativescript.widgets.FlexboxLayout.LayoutParams) ? lp.alignSelf : "auto";
//     });

//     nativeGetters.set("formattedText", (v: { nativeView: android.view.View }) => {
//         const nativeView = v.nativeView;
//         return (nativeView instanceof android.widget.TextView) ? nativeView.getText().toString() : undefined;
//     });

//     nativeGetters.set("isUserInteractionEnabled", (v) => true);

//     nativeGetters.set("orientation", (v: { nativeView: android.view.View }) => {
//         const nativeView = v.nativeView;
//         if (nativeView instanceof org.nativescript.widgets.StackLayout) {
//             return nativeView.getOrientation();
//         } else if (nativeView instanceof org.nativescript.widgets.WrapLayout) {
//             return nativeView.getOrientation();
//         }
//     });

//     nativeGetters.set("textTransform", (v: { nativeView: android.view.View }) => {
//         const nativeView = v.nativeView;
//         if (nativeView instanceof android.widget.TextView) {
//             return nativeView.getTransformationMethod();
//         }
//     });

//     nativeGetters.set("editable", (v: { nativeView: android.view.View }) => {
//         const nativeView = v.nativeView;
//         if (nativeView instanceof android.widget.TextView) {
//             return nativeView.getKeyListener();
//         }
//     });

//     nativeGetters.set("maxLength", (v: { nativeView: android.view.View }) => {
//         const nativeView = v.nativeView;
//         if (nativeView instanceof android.widget.TextView) {
//             return nativeView.getFilters();
//         }
//     });

//     nativeGetters.set("whiteSpace", (v: { nativeView: android.view.View }) => {
//         const nativeView = v.nativeView;
//         if (nativeView instanceof android.widget.TextView) {
//             return { lineCount: nativeView.getLineCount(), ellipsize: nativeView.getEllipsize() };
//         }
//     });

//     nativeGetters.set("text", (v: { nativeView: android.view.View }) => {
//         const nativeView = v.nativeView;
//         if (nativeView instanceof android.widget.TextView) {
//             const text = nativeView.getText();
//             return text ? text.toString() : text;
//         }
//     });
// }
