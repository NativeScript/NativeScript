import { describe, it, expect, beforeAll } from 'vitest';

import { Label } from '../label';
import { Button } from '../button';
import { TextField } from '../text-field';
import { paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, paddingInternalProperty, _hasPaddingSetNativeOverrides } from './style-properties';
import { CoreTypes } from '../../core-types';

const sideProperties = [paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty];

// The native view stub records writes to `padding`, the way TNSLabel receives them.
function stubNativeView(view: any) {
	const writes: any[] = [];
	const nativeView = {
		padding: { top: 1, right: 2, bottom: 3, left: 4 },
	};
	Object.defineProperty(nativeView, 'padding', {
		get: () => ({ top: 1, right: 2, bottom: 3, left: 4 }),
		set: (value) => writes.push(value),
	});
	Object.defineProperty(view, 'nativeTextViewProtected', { value: nativeView, configurable: true });

	return writes;
}

beforeAll(() => {
	(globalThis as any).UIEdgeInsets =
		(globalThis as any).UIEdgeInsets ??
		class {
			constructor(value: any) {
				Object.assign(this, value);
			}
		};
});

describe('padding setNative protocol', () => {
	it.each([
		['Label', Label],
		['Button', Button],
		['TextField', TextField],
	])('%s defines a handler for every padding side', (_name, cls: any) => {
		for (const property of sideProperties) {
			expect(typeof cls.prototype[property.setNative]).toBe('function');
		}
	});

	it('detects per-side overrides on the subclass, not the core class', () => {
		class PluginLabel extends Label {
			[paddingTopProperty.setNative](_value: CoreTypes.LengthType) {}
		}

		expect(_hasPaddingSetNativeOverrides(new Label(), Label.prototype)).toBe(false);
		expect(_hasPaddingSetNativeOverrides(new PluginLabel(), Label.prototype)).toBe(true);
	});

	it('a subclass handler can chain to super, like plugins do', () => {
		class PluginLabel extends Label {
			superCalls = 0;

			[paddingTopProperty.setNative](value: CoreTypes.LengthType) {
				this.superCalls++;
				super[paddingTopProperty.setNative](value);
			}
		}

		const label = new PluginLabel();
		const writes = stubNativeView(label);

		expect(() => (label as any)[paddingTopProperty.setNative](5)).not.toThrow();
		expect(label.superCalls).toBe(1);
		// The chained base handler applies the side itself, keeping the others intact.
		expect(writes).toHaveLength(1);
		expect(writes[0]).toMatchObject({ right: 2, bottom: 3, left: 4 });
	});

	it('the consolidated write stands down when a side is overridden', () => {
		class PluginLabel extends Label {
			[paddingTopProperty.setNative](_value: CoreTypes.LengthType) {
				// suppress
			}
		}

		const label = new PluginLabel();
		const writes = stubNativeView(label);

		(label as any)[paddingInternalProperty.setNative]('');
		expect(writes).toHaveLength(0);

		(label as any)[paddingTopProperty.setNative](5);
		expect(writes).toHaveLength(0);
	});

	it('the consolidated write applies once when nothing is overridden', () => {
		const label = new Label();
		const writes = stubNativeView(label);

		(label as any)[paddingInternalProperty.setNative]('');
		expect(writes).toHaveLength(1);

		// Standalone per-side invocations rely on the consolidated flush.
		(label as any)[paddingTopProperty.setNative](5);
		expect(writes).toHaveLength(1);
	});
});
