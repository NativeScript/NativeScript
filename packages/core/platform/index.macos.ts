export const platformNames = {
	android: 'Android',
	ios: 'iOS',
	visionos: 'visionOS',
	macos: 'macOS',
	apple: 'apple',
};

export const isAndroid = !!__ANDROID__;
export const isIOS = !!__IOS__;
export const isVisionOS = !!__VISIONOS__;
export const isApple = !!__APPLE__;
export const isMacOS = isApple && !isIOS && !isVisionOS;

export * from './device';
export * from './screen';
