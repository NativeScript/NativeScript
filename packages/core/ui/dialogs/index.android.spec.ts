import { describe, it, expect, vi, beforeEach } from 'vitest';

const { activity, themedContext, created } = vi.hoisted(() => {
	const activity = { name: 'activity' };
	const themedContext = { name: 'themed dialog context' };
	const created: Array<{ type: string; context: unknown }> = [];

	class Builder {
		getContext() {
			return themedContext;
		}
		setTitle() {}
		setMessage() {}
		setCancelable() {}
		setView() {}
		setPositiveButton() {}
		setNegativeButton() {}
		setNeutralButton() {}
		setOnDismissListener() {}
		show(): never {
			throw new Error('dialog shown');
		}
	}

	class TextInput {
		private inputType = 0;
		constructor(public context: unknown) {
			created.push({ type: 'EditText', context });
		}
		setInputType(value: number) {
			this.inputType = value;
		}
		getInputType() {
			return this.inputType;
		}
		setText() {}
		setHint() {}
		setTypeface() {}
		getText() {
			return '';
		}
	}

	class Layout {
		constructor(public context: unknown) {
			created.push({ type: 'LinearLayout', context });
		}
		setOrientation() {}
		addView() {}
	}

	class Listener {
		constructor(public impl: unknown) {}
	}

	const g = globalThis as any;
	g.android = {
		...g.android,
		app: { ...g.android?.app, AlertDialog: { Builder } },
		widget: { ...g.android?.widget, EditText: TextInput, LinearLayout: Layout },
		content: { ...g.android?.content, DialogInterface: { OnClickListener: Listener, OnDismissListener: Listener } },
		text: { ...g.android?.text, InputType: { TYPE_CLASS_TEXT: 1, TYPE_TEXT_VARIATION_PASSWORD: 128 } },
		graphics: { ...g.android?.graphics, Typeface: { DEFAULT: {} } },
	};

	return { activity, themedContext, created };
});

vi.mock('../../utils/native-helper', async (importOriginal) => {
	const actual = await importOriginal<any>();
	return { ...actual, android: { ...actual.android, getCurrentActivity: () => activity } };
});

import { login, prompt } from './index.android';

describe('dialogs (Android) input views', () => {
	beforeEach(() => {
		created.length = 0;
	});

	it('creates the prompt input from the dialog context', async () => {
		await expect(prompt({ title: 't', message: 'm', okButtonText: 'OK' })).rejects.toThrow('dialog shown');

		expect(created).toEqual([{ type: 'EditText', context: themedContext }]);
	});

	it('creates the login inputs and layout from the dialog context', async () => {
		await expect(login({ title: 't', message: 'm', okButtonText: 'OK' })).rejects.toThrow('dialog shown');

		expect(created).toEqual([
			{ type: 'EditText', context: themedContext },
			{ type: 'EditText', context: themedContext },
			{ type: 'LinearLayout', context: themedContext },
		]);
	});
});
