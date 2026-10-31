import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => {
	(globalThis as any).UISwitch ??= class UISwitch {};
});

import { Switch } from './index.ios';

describe('Switch (iOS) background color', () => {
	it('ignores color updates once the native view is gone', () => {
		const view: any = new Switch();
		view.nativeViewProtected = null;

		expect(() => view.setNativeBackgroundColor({})).not.toThrow();
		expect(() => view.setNativeBackgroundColor(null)).not.toThrow();
	});

	it('applies the color to a live native view', () => {
		const view: any = new Switch();
		const native: any = { layer: {}, bounds: { size: { height: 30 } } };
		view.nativeViewProtected = native;
		const color = {};

		view.setNativeBackgroundColor(color);

		expect(native.onTintColor).toBe(color);
		expect(native.backgroundColor).toBe(color);
		expect(native.layer.cornerRadius).toBe(15);
	});
});
