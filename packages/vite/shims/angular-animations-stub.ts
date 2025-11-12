// Angular animations stub for NativeScript HMR development
// This avoids bringing in @angular/animations and platform-browser/animations
// which can include partial Ivy declarations and trigger JIT on device.
// Export minimal no-op symbols for compatibility when referenced indirectly.

export const ANIMATION_MODULE_TYPE = undefined;
export class AnimationBuilder {}
export class BrowserAnimationBuilder {}
export function provideAnimations() {
	return [];
}
export default {};
