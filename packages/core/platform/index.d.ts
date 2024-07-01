/**
 * Contains all kinds of information about the device, its operating system and software.
 */

/* tslint:disable:class-name */

/**
 * Gets a value indicating if the app is running on the Android platform.
 */
export const isAndroid: boolean;

/**
 * Gets a value indicating if the app is running on the iOS platform.
 */
export const isIOS: boolean;

/**
 * Gets a value indicating if the app is running on an Apple platform.
 */
export const isApple: boolean;

/**
 * Gets a value indicating if the app is running on the iOS platform.
 */
export const isVisionOS: boolean;

export * from './common';
export * from './device';
export * from './screen';
