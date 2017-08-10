import { time } from 'tns-core-modules/profiling';
import { ActionBar } from 'tns-core-modules/ui/action-bar';
import { ActivityIndicator } from 'tns-core-modules/ui/activity-indicator';
import { Border } from 'tns-core-modules/ui/border';
import { Button } from 'tns-core-modules/ui/button';
import { ContentView } from 'tns-core-modules/ui/content-view';
import { DatePicker } from 'tns-core-modules/ui/date-picker';
import { HtmlView } from 'tns-core-modules/ui/html-view';
import { Image } from 'tns-core-modules/ui/image';
import { Label } from 'tns-core-modules/ui/label';
import { AbsoluteLayout } from 'tns-core-modules/ui/layouts/absolute-layout';
import { DockLayout } from 'tns-core-modules/ui/layouts/dock-layout';
import { FlexboxLayout } from 'tns-core-modules/ui/layouts/flexbox-layout';
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { WrapLayout } from 'tns-core-modules/ui/layouts/wrap-layout';
import { ListPicker } from 'tns-core-modules/ui/list-picker';
import { ListView } from 'tns-core-modules/ui/list-view';
import { Page } from 'tns-core-modules/ui/page';
import { Progress } from 'tns-core-modules/ui/progress';
import { Repeater } from 'tns-core-modules/ui/repeater';
import { SegmentedBar } from 'tns-core-modules/ui/segmented-bar';
import { Switch } from 'tns-core-modules/ui/switch';
import { TabView } from 'tns-core-modules/ui/tab-view';
import { TextField } from 'tns-core-modules/ui/text-field';
import { TextView } from 'tns-core-modules/ui/text-view';
import { TimePicker } from 'tns-core-modules/ui/time-picker';
import { View } from 'tns-core-modules/ui/core/view';
import { FormattedString, Span } from "tns-core-modules/text/formatted-string";

export function testAll(layout: StackLayout): string {
    setupSetters();
    const count = 100;
    let result = '';
    // result += test(layout, () => new FlexboxLayout(), count);    
    // result += test(layout, () => new ActionBar(), count);
    // result += test(layout, () => new ActivityIndicator(), count);
    // result += test(layout, () => new Border(), count);
    result += test(layout, () => new Button(), count);
    // result += test(layout, () => new ContentView(), count);
    // result += test(layout, () => new DatePicker(), count);
    // result += test(layout, () => new HtmlView(), count);
    // result += test(layout, () => new Image(), count);
    // result += test(layout, () => new Label(), count);
    // result += test(layout, () => new AbsoluteLayout(), count);
    // result += test(layout, () => new DockLayout(), count);
    // result += test(layout, () => new GridLayout(), count);
    // result += test(layout, () => new StackLayout(), count);
    // result += test(layout, () => new WrapLayout(), count);
    // result += test(layout, () => new ListPicker(), count);
    // result += test(layout, () => new ListView(), count);
    // result += test(layout, () => new Page(), count);
    // result += test(layout, () => new Progress(), count);
    // result += test(layout, () => new Repeater(), count);
    // result += test(layout, () => new Switch(), count);
    // result += test(layout, () => new TextField(), count);
    // result += test(layout, () => new TextView(), count);
    
    // Throws
    // result += test(layout, () => new TabView(), count);
    // result += test(layout, () => new SegmentedBar(), count);
    // result += test(layout, () => new TimePicker(), count);

    return result;
}

function test(layout: StackLayout, createView: () => View, count: number): string {
    const viewMap1 = new Map<string, any>();
    const cssMap1 = new Map<string, any>();
    
    viewMap1.set('isEnabled', false);
    let result = execute(layout, createView, count, viewMap1, cssMap1) + ', ';

    viewMap1.set('text', 'text');
    viewMap1.set('automationText', "automationText");
    cssMap1.set('width', 100);
    cssMap1.set('height', 100);
    cssMap1.set('rotate', '90');
    result += execute(layout, createView, count, viewMap1, cssMap1) + ', ';

    viewMap1.set('clipToBounds', false);
    viewMap1.set('left', '20');
    viewMap1.set('top', '20');
    viewMap1.set('dock', 'top');
    viewMap1.set('stretchLastChild', false);

    cssMap1.set('paddingLeft', '30px');
    cssMap1.set('paddingTop', '30px');
    cssMap1.set('paddingRight', '30px');
    cssMap1.set('paddingBottom', '30px');
    cssMap1.set('horizontalAlignment', 'center');
    cssMap1.set('verticalAlignment', 'center');

    result += execute(layout, createView, count, viewMap1, cssMap1) + ', ';

    viewMap1.set('row', '1');
    viewMap1.set('rowSpan', '2');
    viewMap1.set('col', '1');
    viewMap1.set('colSpan', '2');

    cssMap1.set('rotate', '90');
    cssMap1.set('scaleX', 2);
    cssMap1.set('scaleY', 2);
    cssMap1.set('translateX', 20);
    cssMap1.set('translateY', 20);
    cssMap1.set('clipPath', 'inset(100px 50px)');
    cssMap1.set('color', 'red');
    cssMap1.set('tintColor', 'green');
    cssMap1.set('placeholderColor', 'green');
    cssMap1.set('backgroundColor', 'red');
    cssMap1.set('backgroundImage', '~/logo.png');

    result += execute(layout, createView, count, viewMap1, cssMap1) + ', ';
    result += execute(layout, createView, count, setters, cssSetters);

    return `${createView().typeName}: ${result}\n`;
}

function execute(layout: StackLayout, createView: () => View, count: number,
    viewProps: Map<string, any>, cssProps: Map<string, any>): string {
    const not = profile(layout, createView, count, false, viewProps, cssProps);
    const recycled = profile(layout, createView, count, true, viewProps, cssProps);

    const improved = ((not - recycled) / not) * 100;
    console.log(`recycled time: ${recycled}`);
    console.log(`not recycled time: ${not}`);
    const propCount = viewProps.size + cssProps.size;
    return `${propCount}: ${improved.toFixed(0)}%`;
}

function profile(layout: StackLayout, createView: () => View, count: number, recycle: boolean,
    viewProps: Map<string, any>, cssProps: Map<string, any>): number {

    const view = createView();
    view.recycleNativeView = recycle ? 'always' : 'never';
    const style = view.style;

    viewProps.forEach((v, k) => view[k] = v);
    cssProps.forEach((v, k) => style[k] = v);

    gc();
    java.lang.System.gc();
    const start = time();

    for (let i = 0; i < count; i++) {
        layout.addChild(view);
        layout.removeChild(view);
    }

    const end = time() - start;
    return end;
}

let setters: Map<string, any>;
let cssSetters: Map<string, any>;

function setupSetters(): void {
    if (setters) {
        return;
    }

    setters = new Map<string, any>();
    // view-base
    setters.set('id', "someId");
    setters.set('className', "someClassName");
    setters.set('bindingContext', "someBindingContext");

    // view
    setters.set('automationText', "automationText");
    setters.set('originX', 0.2);
    setters.set('originY', 0.2);
    setters.set('isEnabled', false);
    setters.set('isUserInteractionEnabled', false);

    // action-bar
    setters.set('title', 'title');
    setters.set('text', 'text');
    setters.set('icon', '~/logo.png');
    setters.set('visibility', 'collapse');

    // activity-indicator
    setters.set('busy', true);

    // date-picker
    setters.set('year', '2010');
    setters.set('month', '2');
    setters.set('day', '2');
    setters.set('maxDate', '2100');
    setters.set('minDate', '2000');
    setters.set('date', new Date(2011, 3, 3));

    // editable-text
    setters.set('keyboardType', 'datetime');
    setters.set('returnKeyType', 'done');
    setters.set('editable', false);
    setters.set('updateTextTrigger', 'focusLost');
    setters.set('autocapitalizationType', 'words');
    setters.set('autocorrect', true);
    setters.set('hint', 'hint');
    setters.set('maxLength', '10');

    // html-view
    setters.set('html', '<a></a>');

    // image-view
    setters.set('imageSource', '');
    setters.set('src', '');
    setters.set('loadMode', 'async');
    setters.set('isLoading', true);
    setters.set('stretch', 'none');

    // layout-base
    setters.set('clipToBounds', false);

    // absolute-layout
    setters.set('left', '20');
    setters.set('top', '20');

    // dock-layout
    setters.set('dock', 'top');
    setters.set('stretchLastChild', false);

    // grid-layout props
    setters.set('row', '1');
    setters.set('rowSpan', '2');
    setters.set('col', '1');
    setters.set('colSpan', '2');

    // stack-layout
    setters.set('orientation', 'horizontal');

    // wrap-layout
    // custom orientation value
    // setters.set('orientation', 'vertical');
    setters.set('itemWidth', '50');
    setters.set('itemHeight', '50');

    // list-picker
    setters.set('items', ['1', '2', '3']);
    setters.set('selectedIndex', '1');

    // list-view
    setters.set('items', ['1', '2', '3']);
    setters.set('itemTemplate', '<Label text="{{ $value }}" />');
    setters.set('itemTemplates', '<template key="green"><Label text="{{ $value }}" style.backgroundColor="green" /></template><template key="red"><Label text="{{ $value }}" style.backgroundColor="red" /></template>');
    setters.set('rowHeight', '50');

    // page
    setters.set('actionBarHidden', 'true');
    setters.set('backgroundSpanUnderStatusBar', 'true');
    setters.set('enableSwipeBackNavigation', 'false');

    // progress
    setters.set('value', '1');
    setters.set('maxValue', '99');

    // repeater
    setters.set('items', ['1', '2', '3']);
    setters.set('itemTemplate', '<Label text="{{ $value }}" />');
    // setters.set('itemsLayout', new StackLayout());
    setters.set('rowHeight', '50');

    // scroll-view
    // custom orientation value
    //setters.set('orientation', 'horizontal');

    // search-bar
    setters.set('textFieldHintColor', 'red');
    setters.set('textFieldBackgroundColor', 'red');

    // segmented-bar
    // custom items property

    // slider
    setters.set('minValue', '5');

    // switch
    setters.set('checked', 'true');

    // tab-view
    // custom items property
    setters.set('androidOffscreenTabLimit', '2');

    // text-base
    const formattedText = new FormattedString();
    const span = new Span();
    span.text = 'span';
    formattedText.spans.push(span);
    setters.set('formattedText', formattedText);

    // text-base
    setters.set('secure', 'true');

    // time-picker
    setters.set('minHour', 1);
    setters.set('hour', 2);
    setters.set('maxHour', 11);
    setters.set('minMinute', 1);
    setters.set('minute', 2);
    setters.set('maxMinute', 11);
    setters.set('minuteInterval', 2);
    setters.set('time', new Date(2011, 2, 2, 3, 3, 3));

    cssSetters = new Map<string, any>();

    // style
    cssSetters.set('rotate', '90');
    cssSetters.set('scaleX', 2);
    cssSetters.set('scaleY', 2);
    cssSetters.set('translateX', 20);
    cssSetters.set('translateY', 20);

    cssSetters.set('clipPath', 'inset(100px 50px)');
    cssSetters.set('color', 'red');
    cssSetters.set('tintColor', 'green');
    cssSetters.set('placeholderColor', 'green');

    cssSetters.set('backgroundColor', 'red');
    cssSetters.set('backgroundImage', '~/logo.png');
    cssSetters.set('backgroundRepeat', 'repeat');
    cssSetters.set('backgroundSize', '60px 120px');
    cssSetters.set('backgroundPosition', 'center');
    cssSetters.set('borderColor', 'blue');
    cssSetters.set('borderTopColor', 'green');
    cssSetters.set('borderRightColor', 'green');
    cssSetters.set('borderBottomColor', 'green');
    cssSetters.set('borderLeftColor', 'green');
    cssSetters.set('borderWidth', '10px');
    cssSetters.set('borderTopWidth', '5px');
    cssSetters.set('borderRightWidth', '5px');
    cssSetters.set('borderBottomWidth', '5px');
    cssSetters.set('borderLeftWidth', '5px');
    cssSetters.set('borderRadius', '10px');
    cssSetters.set('borderTopLeftRadius', '5px');
    cssSetters.set('borderTopRightRadius', '5px');
    cssSetters.set('borderBottomRightRadius', '5px');
    cssSetters.set('borderBottomLeftRadius', '5px');

    cssSetters.set('fontSize', '20');
    cssSetters.set('fontFamily', 'monospace');
    cssSetters.set('fontStyle', 'italic');
    cssSetters.set('fontWeight', '100');
    cssSetters.set('font', 'italic 2 "Open Sans", sans-serif');

    // zIndex on android is not what you think...
    // cssSetters.set('zIndex', '2');
    cssSetters.set('opacity', '0.5');
    // already set through view properties.
    // cssSetters.set('visibility', 'collapse');

    cssSetters.set('letterSpacing', '2');
    cssSetters.set('textAlignment', 'center');
    cssSetters.set('textDecoration', 'underline');
    cssSetters.set('textTransform', 'capitalize');
    cssSetters.set('whiteSpace', 'normal');

    cssSetters.set('minWidth', 50);
    cssSetters.set('minHeight', 50);
    cssSetters.set('width', 100);
    cssSetters.set('height', 100);
    cssSetters.set('margin', '25');
    cssSetters.set('marginLeft', '30px');
    cssSetters.set('marginTop', '30px');
    cssSetters.set('marginRight', '30px');
    cssSetters.set('marginBottom', '30px');
    cssSetters.set('padding', '25');
    cssSetters.set('paddingLeft', '30px');
    cssSetters.set('paddingTop', '30px');
    cssSetters.set('paddingRight', '30px');
    cssSetters.set('paddingBottom', '30px');
    cssSetters.set('horizontalAlignment', 'center');
    cssSetters.set('verticalAlignment', 'center');

    cssSetters.set('transform', 'translate(5, 10), scale(1.2, 1.2), rotate(45)');

    // TabView-specific props
    cssSetters.set('tabTextColor', 'red');
    cssSetters.set('tabBackgroundColor', 'red');
    cssSetters.set('selectedTabTextColor', 'red');
    cssSetters.set('androidSelectedTabHighlightColor', 'red');

    // ListView-specific props 
    cssSetters.set('separatorColor', 'red');

    // SegmentedBar-specific props
    cssSetters.set('selectedBackgroundColor', 'red');

    // Page-specific props 
    cssSetters.set('statusBarStyle', 'light');
    cssSetters.set('androidStatusBarBackground', 'red');

    // Flexbox-layout props
    // cssSetters.set('flexDirection', 'column');
    // cssSetters.set('flexWrap', 'wrap');
    // cssSetters.set('justifyContent', 'center');
    // cssSetters.set('alignItems', 'center');
    // cssSetters.set('alignContent', 'center');
    // cssSetters.set('order', '2');
    // cssSetters.set('flexGrow', '1');
    // cssSetters.set('flexShrink', '0');
    // cssSetters.set('flexWrapBefore', 'true');
    // cssSetters.set('alignSelf', 'center');
    // cssSetters.set('flexFlow', 'row-reverse wrap');
    // cssSetters.set('flex', '2 0.2');
}