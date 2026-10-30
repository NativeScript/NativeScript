import { describe, it, expect } from 'vitest';

import { Label } from '../../label';

function classesOf(className: string): string[] {
	const view = new Label();
	view.className = className;

	return [...view.cssClasses];
}

describe('className', () => {
	it('splits on spaces', () => {
		expect(classesOf('a b c')).toEqual(['a', 'b', 'c']);
	});

	it('splits on newlines and tabs', () => {
		expect(classesOf('\n\ta\n\tb\tc\n')).toEqual(['a', 'b', 'c']);
	});

	it('ignores repeated whitespace', () => {
		expect(classesOf('  a   b  ')).toEqual(['a', 'b']);
	});

	it('clears classes for an empty string', () => {
		const view = new Label();
		view.className = 'a b';
		view.className = '';

		expect([...view.cssClasses]).toEqual([]);
	});
});
