export const ApplicationEventNames = Object.freeze({
	launchEvent: 'launch',
	suspendEvent: 'suspend',
	displayedEvent: 'displayed',
	backgroundEvent: 'background',
	foregroundEvent: 'foreground',
	resumeEvent: 'resume',
	exitEvent: 'exit',
	lowMemoryEvent: 'lowMemory',
	uncaughtErrorEvent: 'uncaughtError',
	discardedErrorEvent: 'discardedError',
	orientationChangedEvent: 'orientationChanged',
	systemAppearanceChangedEvent: 'systemAppearanceChanged',
	layoutDirectionChangedEvent: 'layoutDirectionChanged',
	fontScaleChangedEvent: 'fontScaleChanged',
	livesyncEvent: 'livesync',
	loadAppCssEvent: 'loadAppCss',
	cssChangedEvent: 'cssChanged',
	initRootViewEvent: 'initRootView',
});

export type ApplicationEventNameType = typeof ApplicationEventNames;
export type ApplicationEventName = ApplicationEventNameType[keyof ApplicationEventNameType];
