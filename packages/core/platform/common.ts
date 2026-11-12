/*
 * Enum holding platform names.
 */
export const platformNames = {
	android: 'Android',
	ios: 'iOS',
	visionos: 'visionOS',
	apple: 'apple',
	windows: 'Windows',
	linux: 'Linux',
};

export const isAndroid = !!__ANDROID__;
export const isIOS = !!__IOS__ || !!__VISIONOS__;
export const isVisionOS = !!__VISIONOS__;
export const isApple = !!__APPLE__;
export const isWindows = typeof __WINDOWS__ !== 'undefined' && !!__WINDOWS__;
export const isLinux = typeof __LINUX__ !== 'undefined' && !!__LINUX__;
