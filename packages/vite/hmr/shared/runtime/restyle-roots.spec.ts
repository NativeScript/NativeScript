import { describe, expect, it, vi } from 'vitest';
import { restyleRootAndModals } from './restyle-roots';

function view(overrides: Record<string, unknown> = {}) {
	return { _onCssStateChange: vi.fn(), className: '', ...overrides };
}

describe('restyleRootAndModals', () => {
	it('restyles the root view', () => {
		const root = view();
		restyleRootAndModals(root);
		expect(root._onCssStateChange).toHaveBeenCalledTimes(1);
	});

	it('restyles every presented modal, which the root walk cannot reach', () => {
		const first = view();
		const second = view();
		const root = view({ _getRootModalViews: () => [first, second] });
		restyleRootAndModals(root);
		expect(first._onCssStateChange).toHaveBeenCalledTimes(1);
		expect(second._onCssStateChange).toHaveBeenCalledTimes(1);
	});

	it('falls back to a className round-trip when the view predates _onCssStateChange', () => {
		const seen: string[] = [];
		let stored = 'page';
		const root = {
			get className() {
				return stored;
			},
			set className(next: string) {
				stored = next;
				seen.push(next);
			},
		};
		restyleRootAndModals(root);
		expect(seen).toEqual(['page ', 'page']);
	});

	it('keeps going when one view throws', () => {
		const broken = view({
			_onCssStateChange: () => {
				throw new Error('boom');
			},
		});
		const healthy = view();
		const root = view({ _getRootModalViews: () => [broken, healthy] });
		expect(() => restyleRootAndModals(root)).not.toThrow();
		expect(healthy._onCssStateChange).toHaveBeenCalledTimes(1);
	});

	it('survives a core build with no modal accessor', () => {
		const root = view({ _getRootModalViews: undefined });
		expect(() => restyleRootAndModals(root)).not.toThrow();
		expect(root._onCssStateChange).toHaveBeenCalledTimes(1);
	});

	it('survives _getRootModalViews throwing', () => {
		const root = view({
			_getRootModalViews: () => {
				throw new Error('no window');
			},
		});
		expect(() => restyleRootAndModals(root)).not.toThrow();
		expect(root._onCssStateChange).toHaveBeenCalledTimes(1);
	});

	it('ignores a missing root', () => {
		expect(() => restyleRootAndModals(null)).not.toThrow();
		expect(() => restyleRootAndModals(undefined)).not.toThrow();
	});

	it('visits each view once across Application realms that share a root', () => {
		const modal = view();
		const root = view({ _getRootModalViews: () => [modal] });
		const seen = new Set<unknown>();
		restyleRootAndModals(root, seen);
		restyleRootAndModals(root, seen);
		expect(root._onCssStateChange).toHaveBeenCalledTimes(1);
		expect(modal._onCssStateChange).toHaveBeenCalledTimes(1);
	});

	it('still restyles a second root that presents the same modal only once', () => {
		const modal = view();
		const first = view({ _getRootModalViews: () => [modal] });
		const second = view({ _getRootModalViews: () => [modal] });
		const seen = new Set<unknown>();
		restyleRootAndModals(first, seen);
		restyleRootAndModals(second, seen);
		expect(first._onCssStateChange).toHaveBeenCalledTimes(1);
		expect(second._onCssStateChange).toHaveBeenCalledTimes(1);
		expect(modal._onCssStateChange).toHaveBeenCalledTimes(1);
	});
});
