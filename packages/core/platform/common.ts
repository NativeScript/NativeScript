/*
 * Enum holding platform names.
 */
export const platformNames = {
	android: 'Android',
	ios: 'iOS',
	visionos: 'visionOS',
	tvos: 'tvOS',
	apple: 'apple',
};

export const isAndroid = !!__ANDROID__;
export const isTvOS = typeof __TVOS__ !== 'undefined' && !!__TVOS__;
export const isIOS = !!__IOS__ || !!__VISIONOS__ || isTvOS;
export const isVisionOS = !!__VISIONOS__;
export const isApple = !!__APPLE__;
