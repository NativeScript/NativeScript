import { describe, it, expect, vi } from 'vitest';

vi.hoisted(() => {
	const g = globalThis as any;
	g.android = {
		...g.android,
		text: {
			...g.android?.text,
			InputType: { TYPE_NULL: 0, TYPE_CLASS_TEXT: 1, TYPE_CLASS_NUMBER: 2, TYPE_CLASS_PHONE: 3, TYPE_TEXT_VARIATION_EMAIL_ADDRESS: 32 },
		},
	};
});

import { EditableTextBase } from './index.android';
import { keyboardTypeProperty } from './editable-text-base-common';

function inputTypeFor(value: unknown): number {
	const target = { _setInputType: vi.fn() };
	(EditableTextBase.prototype as any)[keyboardTypeProperty.setNative].call(target, value);
	return target._setInputType.mock.calls[0][0];
}

describe('EditableTextBase keyboardType (Android)', () => {
	const InputType = (globalThis as any).android.text.InputType;

	it('uses the text keyboard for null and undefined', () => {
		expect(inputTypeFor(null)).toBe(InputType.TYPE_CLASS_TEXT);
		expect(inputTypeFor(undefined)).toBe(InputType.TYPE_CLASS_TEXT);
	});

	it('uses the text keyboard for unknown names', () => {
		expect(inputTypeFor('text')).toBe(InputType.TYPE_CLASS_TEXT);
	});

	it('passes native input type numbers through, including TYPE_NULL', () => {
		expect(inputTypeFor(InputType.TYPE_CLASS_PHONE)).toBe(InputType.TYPE_CLASS_PHONE);
		expect(inputTypeFor('3')).toBe(InputType.TYPE_CLASS_PHONE);
		expect(inputTypeFor(0)).toBe(InputType.TYPE_NULL);
	});

	it('maps named keyboard types', () => {
		expect(inputTypeFor('integer')).toBe(InputType.TYPE_CLASS_NUMBER);
	});
});
