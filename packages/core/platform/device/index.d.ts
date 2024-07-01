/*
 * An object containing device specific information.
 */
export interface IDevice {
	/**
	 * Gets the manufacturer of the device.
	 * For example: "Apple" or "HTC" or "Samsung".
	 */
	manufacturer: string;

	/**
	 * Gets the model of the device.
	 * For example: "Nexus 5" or "iPhone".
	 */
	model: string;

	/**
	 * Gets the OS of the device.
	 * For example: "Android" or "iOS".
	 */
	os: string;

	/**
	 * Gets the OS version.
	 * For example: 4.4.4(android), 8.1(ios)
	 */
	osVersion: string;

	/**
	 * Gets the SDK version.
	 * For example: 19(android), 8.1(ios).
	 */
	sdkVersion: string;

	/**
	 * Gets the type of the current device.
	 * Available values: "Phone", "Tablet".
	 */
	deviceType: 'Phone' | 'Tablet';

	/**
	 * Gets the uuid.
	 * On iOS this will return a new uuid if the application is re-installed on the device.
	 * If you need to receive the same uuid even after the application has been re-installed on the device,
	 * use this plugin: https://www.npmjs.com/package/nativescript-ios-uuid
	 */
	uuid: string;

	/**
	 * Gets the preferred language. For example "en" or "en-US".
	 */
	language: string;

	/**
	 * Gets the preferred region. For example "US".
	 */
	region: string;
}

/**
 * Gets the current device information.
 */
export const Device: IDevice;

/**
 * Gets the current device information.
 *
 * This retains compatibility with NS6
 */
export const device: IDevice;
