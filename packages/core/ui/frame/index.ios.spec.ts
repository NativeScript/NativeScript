import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Frame } from './index.ios';
import { IOSHelper } from '../core/view/view-helper';

const animation = 'navigationControllerAnimationControllerForOperationFromViewControllerToViewController';
const interaction = 'navigationControllerInteractionControllerForAnimationController';
const didShow = 'navigationControllerDidShowViewControllerAnimated';

function navigate(transition?: any, controller: any = {}, animated = true, viewController: any = { navigationItem: {} }) {
	controller.pushViewControllerAnimated = vi.fn();
	const frame = {
		_ios: { controller },
		currentPage: {},
		_currentEntry: { entry: {} },
		_getIsAnimatedNavigation: () => animated,
		_getNavigationTransition: () => transition,
		direction: 'ltr',
	};
	Frame.prototype._navigateCore.call(frame as any, { entry: {}, resolvedPage: { ios: viewController } } as any);
	return { controller, viewController, delegate: controller.delegate };
}

describe('iOS Frame navigation delegates', () => {
	beforeAll(() => {
		vi.spyOn(IOSHelper, 'invalidateStatusBarAppearance').mockImplementation(() => {});
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it('does not advertise custom transition callbacks for default navigation', () => {
		const { delegate, viewController } = navigate();
		expect(delegate[animation]).toBeUndefined();
		expect(delegate[interaction]).toBeUndefined();
		expect(viewController._delegate).toBe(delegate);
		expect(delegate[didShow]).toBeTypeOf('function');
	});

	it('keeps custom animator forwarding and the departing page delegate', () => {
		const animator = {};
		const instance = { id: 123, iosNavigatedController: vi.fn(() => animator) };
		const custom = navigate({ instance });
		expect(custom.delegate[animation](custom.controller, 1, {}, custom.viewController)).toBe(animator);
		expect(custom.delegate[animation](custom.controller, 2, custom.viewController, {})).toBe(animator);
		expect(custom.delegate[interaction]).toBeTypeOf('function');
		const standard = navigate(undefined, custom.controller);
		expect(standard.delegate[animation]).toBeUndefined();
		expect(custom.viewController._delegate).toBe(custom.delegate);
		expect(custom.viewController._delegate).not.toBe(standard.delegate);
	});

	it('keeps named transitions on the custom delegate', () => {
		const { delegate } = navigate({ name: 'fade' });
		expect(delegate[animation]).toBeTypeOf('function');
		expect(delegate[interaction]).toBeTypeOf('function');
	});

	it('keeps didShow bookkeeping for both delegate types', () => {
		for (const transition of [undefined, { name: 'fade' }]) {
			const { delegate, controller, viewController } = navigate(transition);
			controller.owner = { _onViewControllerShown: vi.fn() };
			delegate[didShow](controller, viewController, true);
			expect(controller.owner._onViewControllerShown).toHaveBeenCalledExactlyOnceWith(viewController);
		}
	});

	it('does not expose a custom animator when animation is disabled', () => {
		const { delegate, viewController } = navigate({ name: 'fade' }, {}, false);
		expect(delegate[animation]).toBeUndefined();
		expect(viewController._transition).toEqual({ name: 'non-animated' });
	});

	it('clears old transition metadata when a Page is reused with default navigation', () => {
		const { viewController } = navigate({ name: 'fade' });
		const reused = navigate(undefined, {}, true, viewController);
		expect(reused.delegate[animation]).toBeUndefined();
		expect(viewController._transition).toBeUndefined();
	});
});
