import { describe, it, expect, beforeAll } from 'vitest';

import { IOSHelper } from '.';
import { layout } from '../../../../utils/layout-helper';

type Rect = { origin: { x: number; y: number }; size: { width: number; height: number } };
const rect = (x: number, y: number, width: number, height: number): Rect => ({ origin: { x, y }, size: { width, height } });

class FakeScrollView {
	constructor(
		public safeAreaInsets: { top: number; left: number; bottom: number; right: number },
		public contentSize: { width: number; height: number },
		public contentOffset: { x: number; y: number },
	) {}
}

class FakeControllerView {
	constructor(
		public frame: Rect,
		private safeFrame: Rect,
		private inWindow: { x: number; y: number },
	) {}
	get safeAreaLayoutGuide() {
		return { layoutFrame: this.safeFrame };
	}
	get bounds() {
		return rect(0, 0, this.frame.size.width, this.frame.size.height);
	}
	convertPointToView() {
		return this.inWindow;
	}
}

// The computation expandBeyondSafeArea made before it read positions directly.
function expandBeyondSafeAreaBefore(view: any, frame: Rect): Rect {
	const availableSpace = IOSHelper.getAvailableSpaceFromParent(view, frame);
	if (!availableSpace || !availableSpace.safeArea || !availableSpace.fullscreen) {
		return frame;
	}
	const position = IOSHelper.getPositionFromFrame(frame);
	const safeAreaPosition = IOSHelper.getPositionFromFrame(availableSpace.safeArea);
	const fullscreenPosition = IOSHelper.getPositionFromFrame(availableSpace.fullscreen);
	const inWindowPosition = IOSHelper.getPositionFromFrame(availableSpace.inWindow);
	const adjustedPosition = position;
	if (position.left && inWindowPosition.left <= safeAreaPosition.left) {
		adjustedPosition.left = fullscreenPosition.left;
	}
	if (position.top && inWindowPosition.top <= safeAreaPosition.top) {
		adjustedPosition.top = fullscreenPosition.top;
	}
	if (inWindowPosition.right < fullscreenPosition.right && inWindowPosition.right >= safeAreaPosition.right + fullscreenPosition.left) {
		adjustedPosition.right += fullscreenPosition.right - inWindowPosition.right;
	}
	if (inWindowPosition.bottom < fullscreenPosition.bottom && inWindowPosition.bottom >= safeAreaPosition.bottom + fullscreenPosition.top) {
		adjustedPosition.bottom += fullscreenPosition.bottom - inWindowPosition.bottom;
	}

	return rect(layout.toDeviceIndependentPixels(adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.top), layout.toDeviceIndependentPixels(adjustedPosition.right - adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.bottom - adjustedPosition.top));
}

function random(seed: number) {
	return () => {
		seed = (seed * 1103515245 + 12345) & 0x7fffffff;
		return seed / 0x7fffffff;
	};
}

describe('IOSHelper.expandBeyondSafeArea', () => {
	beforeAll(() => {
		(global as any).CGRectMake ??= rect;
		(global as any).UIScrollView ??= FakeScrollView;
	});

	function viewIn(container: { scrollView?: FakeScrollView; controllerView?: FakeControllerView }, location: { x: number; y: number }) {
		const parent: any = container.scrollView ? { nativeViewProtected: container.scrollView } : { viewController: { view: container.controllerView } };
		return { parent: { parent }, getLocationInWindow: () => location } as any;
	}

	it('matches the previous computation inside a scroll view and a view controller', () => {
		const next = random(7);
		const pick = (values: number[]) => values[Math.floor(next() * values.length)];
		let expanded = 0;
		for (let i = 0; i < 2000; i++) {
			const insets = { top: pick([0, 47, 59.5]), left: pick([0, 44]), bottom: pick([0, 34]), right: pick([0, 44]) };
			const width = pick([390, 430, 844]);
			const height = pick([844, 932, 2000]);
			const location = { x: pick([0, 0.5, 10, width - 100]), y: pick([0, 20, 47, height - 50]) };
			const frame = rect(pick([0, 3.3333, 10, 44]), pick([0, 16.6667, 47]), pick([100, width, 87.6667]), pick([50, height - 34, 33.3333]));
			const container = next() < 0.5 ? { scrollView: new FakeScrollView(insets, { width, height }, { x: 0, y: pick([0, 120.5]) }) } : { controllerView: new FakeControllerView(rect(0, 0, width, height), rect(insets.left, insets.top, width - insets.left - insets.right, height - insets.top - insets.bottom), { x: 0, y: pick([0, 300]) }) };
			const view = viewIn(container, location);

			const expected = expandBeyondSafeAreaBefore(view, frame);
			const actual = IOSHelper.expandBeyondSafeArea(view, frame as any) as unknown as Rect;

			expect([actual.origin.x, actual.origin.y, actual.size.width, actual.size.height]).toEqual([expected.origin.x, expected.origin.y, expected.size.width, expected.size.height]);
			if (expected.origin.y !== frame.origin.y || expected.size.height !== frame.size.height || expected.size.width !== frame.size.width) {
				expanded++;
			}
		}
		// The cases must include frames that are expanded, not only ones left alone.
		expect(expanded).toBeGreaterThan(200);
	});

	it('returns the frame itself when nothing changes', () => {
		const view = viewIn({ scrollView: new FakeScrollView({ top: 0, left: 0, bottom: 0, right: 0 }, { width: 400, height: 800 }, { x: 0, y: 0 }) }, { x: 100, y: 100 });
		const frame = rect(100, 100, 50, 50);

		expect(IOSHelper.expandBeyondSafeArea(view, frame as any)).toBe(frame);
	});

	it('leaves a detached view alone', () => {
		const frame = rect(0, 0, 10, 10);

		expect(IOSHelper.expandBeyondSafeArea({ getLocationInWindow: () => ({ x: 0, y: 0 }) } as any, frame as any)).toBe(frame);
	});
});
