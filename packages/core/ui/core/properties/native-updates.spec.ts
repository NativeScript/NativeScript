import { describe, it, expect, beforeEach } from 'vitest';

import { View } from '../view';
import { Style } from '../../styling/style';
import { CoercibleProperty, CssAnimationProperty, CssProperty, InheritedCssProperty, InheritedProperty, Property, ShorthandProperty } from './index';
import { unsetValue } from './property-shared';

/**
 * Native writes, default captures and `<name>Change` notifications share one log so that
 * their relative order is part of what every expectation pins down.
 */
const log: string[] = [];

class TestView extends View {
	public testChildren: TestView[] = [];

	createNativeView(): Object {
		return {};
	}

	public eachChildView(callback: (child: any) => boolean): void {
		for (const child of this.testChildren) {
			if (!callback(child)) {
				return;
			}
		}
	}

	// The fake native view is a plain object, so the real subview plumbing cannot run.
	public _addViewToNativeVisualTree(): boolean {
		return true;
	}

	public _removeViewFromNativeVisualTree(view: any): void {
		view._isAddedToNativeVisualTree = false;
	}

	public addTestChild(child: TestView): void {
		this.testChildren.push(child);
		this._addView(child);
	}
}

interface NativeProperty {
	name: string;
	setNative: symbol;
	getDefault: symbol;
}

function trackNative(property: NativeProperty, withDefault = true): void {
	const prototype = TestView.prototype as any;
	prototype[property.setNative] = function (value: unknown) {
		log.push(`${property.name}=${String(value)}`);
	};

	if (withDefault) {
		prototype[property.getDefault] = function () {
			log.push(`${property.name}:getDefault`);

			return `${property.name}-native`;
		};
	}
}

function trackChange(target: any, name: string): void {
	target.on(`${name}Change`, (args: any) => {
		log.push(`${name}Change=${String(args.value)}`);
	});
}

const alphaProperty = new Property<TestView, string>({ name: 'alpha', defaultValue: 'alpha-default' });
alphaProperty.register(TestView);
trackNative(alphaProperty);

const betaProperty = new Property<TestView, string>({ name: 'beta', defaultValue: 'beta-default' });
betaProperty.register(TestView);
trackNative(betaProperty);

/** No `[getDefault]` handler: resets fall back to the property's own default value. */
const epsilonProperty = new Property<TestView, string>({ name: 'epsilon', defaultValue: 'epsilon-default' });
epsilonProperty.register(TestView);
trackNative(epsilonProperty, false);

const zetaProperty = new CoercibleProperty<TestView, number>({
	name: 'zeta',
	defaultValue: 0,
	coerceValue: (target, value) => Math.min(value, 10),
});
zetaProperty.register(TestView);
trackNative(zetaProperty);

const etaProperty = new InheritedProperty<TestView, string>({ name: 'eta', defaultValue: 'eta-default' });
etaProperty.register(TestView);
trackNative(etaProperty);

const gammaProperty = new CssProperty<Style, string>({ name: 'gamma', cssName: 'gamma', defaultValue: 'gamma-default' });
gammaProperty.register(Style);
trackNative(gammaProperty);

const deltaProperty = new CssProperty<Style, string>({ name: 'delta', cssName: 'delta', defaultValue: 'delta-default' });
deltaProperty.register(Style);
trackNative(deltaProperty);

const animProperty = new CssAnimationProperty<Style, string>({ name: 'anim', cssName: 'anim', defaultValue: 'anim-default' });
animProperty.register(Style);
trackNative(animProperty);

const inhProperty = new InheritedCssProperty<Style, string>({ name: 'inh', cssName: 'inh', defaultValue: 'inh-default' });
inhProperty.register(Style);
trackNative(inhProperty);

const gammaDeltaProperty = new ShorthandProperty<Style, string>({
	name: 'gammaDelta',
	cssName: 'gamma-delta',
	getter(this: Style) {
		return `${this.gamma} ${this.delta}`;
	},
	converter: (value: string) => {
		const [gamma, delta] = String(value).split(' ');

		return [
			[gammaProperty, gamma],
			[deltaProperty, delta],
		];
	},
});
gammaDeltaProperty.register(Style as any);

/** A view with a native view, loaded, with nothing pending. */
function loadedView(): any {
	const view: any = new TestView();
	view._setupUI({});
	view.callLoaded();
	log.length = 0;

	return view;
}

beforeEach(() => {
	log.length = 0;
});

describe('native updates on first load', () => {
	it('applies every set property once, view properties before style properties, in insertion order', () => {
		const view: any = new TestView();
		view.alpha = 'a';
		view.style.gamma = 'g';
		view.beta = 'b';
		view.style.delta = 'd';

		expect(log).toEqual([]);

		view._setupUI({});
		view.callLoaded();

		expect(log).toEqual(['alpha:getDefault', 'alpha=a', 'beta:getDefault', 'beta=b', 'gamma:getDefault', 'gamma=g', 'delta:getDefault', 'delta=d']);
	});

	it('does not apply properties that were never set', () => {
		const view: any = new TestView();
		view.beta = 'b';

		view._setupUI({});
		view.callLoaded();

		expect(log).toEqual(['beta:getDefault', 'beta=b']);
	});
});

describe('native updates on a live view', () => {
	it('applies each set immediately, without collapsing A to B back to A', () => {
		const view = loadedView();

		view.alpha = 'a';
		view.alpha = 'b';
		view.alpha = 'a';

		expect(log).toEqual(['alpha:getDefault', 'alpha=a', 'alpha=b', 'alpha=a']);
	});

	it('does not apply a set that does not change the value', () => {
		const view = loadedView();

		view.alpha = 'a';
		log.length = 0;
		view.alpha = 'a';

		expect(log).toEqual([]);
	});

	it('applies the coerced value', () => {
		const view = loadedView();

		view.zeta = 42;

		expect(log).toEqual(['zeta:getDefault', 'zeta=10']);
	});
});

describe('batched native updates', () => {
	it('applies one native call for repeated sets of the same property', () => {
		const view = loadedView();

		view._batchUpdate(() => {
			view.alpha = '1';
			view.alpha = '2';
			view.alpha = '3';
		});

		expect(log).toEqual(['alpha:getDefault', 'alpha=3']);
	});

	it('applies one native call per property, in first-dirtied order', () => {
		const view = loadedView();

		view._batchUpdate(() => {
			view.beta = 'b';
			view.alpha = 'a';
			view.beta = 'b2';
		});

		expect(log).toEqual(['beta:getDefault', 'beta=b2', 'alpha:getDefault', 'alpha=a']);
	});

	it('keeps the first-dirtied order across view and style properties', () => {
		const view = loadedView();

		view._batchUpdate(() => {
			view.style.gamma = 'g';
			view.alpha = 'a';
		});

		expect(log).toEqual(['gamma:getDefault', 'gamma=g', 'alpha:getDefault', 'alpha=a']);
	});
});

describe('native updates across unload and reload', () => {
	it('re-applies only what changed while unloaded', () => {
		const view = loadedView();
		view.alpha = 'a';
		view.beta = 'b';
		log.length = 0;

		view.callUnloaded();
		view.alpha = 'a2';
		expect(log).toEqual([]);

		view.callLoaded();

		expect(log).toEqual(['alpha=a2']);
	});
});

describe('resetting a property', () => {
	it('pushes the captured native default back and drops the capture', () => {
		const view = loadedView();
		view.alpha = 'a';
		log.length = 0;

		view.alpha = unsetValue;
		view.alpha = 'a2';

		expect(log).toEqual(['alpha=alpha-native', 'alpha:getDefault', 'alpha=a2']);
	});

	it('pushes the property default when the view has no getDefault handler', () => {
		const view = loadedView();
		view.epsilon = 'e';
		log.length = 0;

		view.epsilon = unsetValue;

		expect(log).toEqual(['epsilon=epsilon-default']);
	});

	it('pushes the captured default once when reset while suspended', () => {
		const view = loadedView();
		view.alpha = 'a';
		log.length = 0;

		view._batchUpdate(() => {
			view.alpha = 'a2';
			view.alpha = unsetValue;
		});

		expect(log).toEqual(['alpha=alpha-native']);
	});

	it('pushes an uncaptured default as undefined when reset while suspended', () => {
		const view = loadedView();

		view._batchUpdate(() => {
			view.alpha = 'a';
			view.alpha = unsetValue;
		});

		expect(log).toEqual(['alpha=undefined']);
	});
});

describe('shorthand expansion', () => {
	it('applies one native call per longhand, in converter order', () => {
		const view = loadedView();

		view.style.gammaDelta = 'g d';

		expect(log).toEqual(['gamma:getDefault', 'gamma=g', 'delta:getDefault', 'delta=d']);
	});
});

describe('css value sources', () => {
	it('lets a local value win over a css value', () => {
		const view = loadedView();

		view.style['css:gamma'] = 'from-css';
		view.style.gamma = 'from-local';
		view.style['css:gamma'] = 'from-css-again';

		expect(log).toEqual(['gamma:getDefault', 'gamma=from-css', 'gamma=from-local']);
	});

	it('lets a keyframe value win over a css value', () => {
		const view = loadedView();

		view.style['css:anim'] = 'from-css';
		view.style['keyframe:anim'] = 'from-keyframe';
		view.style['css:anim'] = 'from-css-again';

		expect(log).toEqual(['anim:getDefault', 'anim=from-css', 'anim=from-keyframe']);
	});

	it('propagates an inherited css value into a loaded child', () => {
		const parent: any = new TestView();
		const child: any = new TestView();
		parent.addTestChild(child);
		parent._setupUI({});
		parent.callLoaded();
		log.length = 0;

		parent.style.inh = 'p';

		expect(log).toEqual(['inh:getDefault', 'inh=p', 'inh:getDefault', 'inh=p']);
	});

	it('propagates an inherited view value into a loaded child', () => {
		const parent: any = new TestView();
		const child: any = new TestView();
		parent.addTestChild(child);
		parent._setupUI({});
		parent.callLoaded();
		log.length = 0;

		parent.eta = 'p';

		expect(log).toEqual(['eta:getDefault', 'eta=p', 'eta:getDefault', 'eta=p']);
	});
});

describe('change notifications', () => {
	it('notifies after the native write on a live view', () => {
		const view = loadedView();
		trackChange(view, 'alpha');

		view.alpha = 'a';

		expect(log).toEqual(['alpha:getDefault', 'alpha=a', 'alphaChange=a']);
	});

	it('notifies before the native write while suspended', () => {
		const view = loadedView();
		trackChange(view, 'alpha');

		view._batchUpdate(() => {
			view.alpha = 'a';
		});

		expect(log).toEqual(['alphaChange=a', 'alpha:getDefault', 'alpha=a']);
	});

	it('notifies style property changes on the style', () => {
		const view = loadedView();
		trackChange(view.style, 'gamma');

		view.style.gamma = 'g';

		expect(log).toEqual(['gamma:getDefault', 'gamma=g', 'gammaChange=g']);
	});
});

describe('nativeValueChange', () => {
	it('captures the native default and notifies without writing back to native', () => {
		const view = loadedView();
		trackChange(view, 'alpha');

		alphaProperty.nativeValueChange(view, 'from-native');

		expect(log).toEqual(['alpha:getDefault', 'alphaChange=from-native']);
		expect(view.alpha).toBe('from-native');
	});
});
