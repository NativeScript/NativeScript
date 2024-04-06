/*
 * Enum holding platform names.
 */
export const platformNames = {
	android: 'Android',
	ios: 'iOS',
	visionos: 'visionOS',
};

export const isAndroid = !!__ANDROID__;
export const isIOS = !!__IOS__ || !!__VISIONOS__;
export const isVisionOS = !!__VISIONOS__;
export const isApple = !!__APPLE__;
