import { describe, it, expect, afterEach, vi } from 'vitest';
import { Application } from './application.ios';
import { IOSNativeWindow } from '../native-window/native-window.ios';

function createScene(interfaceOrientation: number, effectiveOrientation?: number): any {
	return {
		session: {},
		interfaceOrientation,
		effectiveGeometry: effectiveOrientation === undefined ? undefined : { interfaceOrientation: effectiveOrientation },
	};
}

function createSceneDelegate(): any {
	return new (global as any).SceneDelegate();
}

describe('iOS scene orientation', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('reads the effective geometry orientation when the scene provides one', () => {
		const window = new IOSNativeWindow(createScene(UIInterfaceOrientation.Portrait, UIInterfaceOrientation.LandscapeLeft), {} as UIWindow);

		expect(window.orientation()).toBe('landscape');
	});

	it('falls back to the scene interface orientation without effective geometry', () => {
		const window = new IOSNativeWindow(createScene(UIInterfaceOrientation.LandscapeRight), {} as UIWindow);

		expect(window.orientation()).toBe('landscape');
	});

	for (const callback of ['windowSceneDidUpdateEffectiveGeometry', 'windowSceneDidUpdateCoordinateSpaceInterfaceOrientationTraitCollection']) {
		it(`raises orientationChanged from ${callback}`, () => {
			const scene = createScene(UIInterfaceOrientation.Portrait, UIInterfaceOrientation.Portrait);
			const window = new IOSNativeWindow(scene, {} as UIWindow);
			vi.spyOn(Application.ios, '_getWindowForScene').mockImplementation((s) => (s === scene ? window : undefined));

			expect(window.orientation()).toBe('portrait');

			const changes: string[] = [];
			window.on('orientationChanged', (args: any) => changes.push(args.newValue));

			scene.effectiveGeometry.interfaceOrientation = UIInterfaceOrientation.LandscapeLeft;
			createSceneDelegate()[callback](scene, null, null, null);

			expect(changes).toEqual(['landscape']);

			createSceneDelegate()[callback](scene, null, null, null);

			expect(changes).toEqual(['landscape']);
		});
	}

	it('ignores geometry updates for a scene with no window', () => {
		vi.spyOn(Application.ios, '_getWindowForScene').mockReturnValue(undefined);

		expect(() => createSceneDelegate().windowSceneDidUpdateEffectiveGeometry(createScene(UIInterfaceOrientation.Portrait), null)).not.toThrow();
	});
});
