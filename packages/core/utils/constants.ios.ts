export const SDK_VERSION = parseFloat(UIDevice.currentDevice.systemVersion);

function hasRuntimeGlobal(name: 'UIGlassEffect' | 'UIGlassContainerEffect' | 'UIGlassEffectStyle'): boolean {
	return typeof (globalThis as any)?.[name] !== 'undefined';
}

export function supportsGlass(): boolean {
	return __APPLE__ && SDK_VERSION >= 26 && hasRuntimeGlobal('UIGlassEffect') && hasRuntimeGlobal('UIGlassContainerEffect') && hasRuntimeGlobal('UIGlassEffectStyle');
}
