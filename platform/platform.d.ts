/* tslint:disable:class-name */
/**
 * Contains all kinds of information about the device, its operating system and software.
 */
declare module "platform" {

    /*
     * Enum holding platform names.
     */
    export module platformNames {
        export var android: string;
        export var ios: string;
    }

    /*
     * An object containing device specific information.
     */
    export class device {
        /**
         * Gets the model of the device.
         * For example: "Nexus 5" or "iPhone.
         */
        static model: string;

        /**
         * Gets the model of the device.
         * For example: "Android" or "iOS".
         */
        static os: string;

        /**
         * Gets the OS version.
         * For example: 4.4.4(android), 8.1(ios)
         */
        static osVersion: string;

        /**
         * Gets the OS version.
         * For example: 19(android), 8.1(ios).
         */
        static sdkVersion: string;

        /**
         * Gets the type current device.
         * Available values: "phone", "tablet".
         */
        static deviceType: string;

        /**
         * Gets the uuid
         */
         static uuid: string;
    }

    /**
     * An object containing screen information.
     */
    export interface ScreenMetrics {
        /**
         * Gets the absolute width of the screen in pixels.
         */
        widthPixels: number;

        /**
         * Gets the absolute height of the screen in pixels.
         */
        heightPixels: number;

        /**
         * Gets the absolute width of the screen in density independent pixels.
         */
        widthDIPs: number;

        /**
         * Gets the absolute height of the screen in density independent pixels.
         */
        heightDIPs: number;

        /**
         * The logical density of the display. This is a scaling factor for the Density Independent Pixel unit.
         */
        scale: number;
    }

    /**
     * An object describing general information about a display.
     */
    export class screen {
        /**
         * Gets information about the main screen of the current device.
         */
        static mainScreen: ScreenMetrics;
    }
}
