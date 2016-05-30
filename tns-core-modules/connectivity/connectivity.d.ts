/**
 * Contains connectivity utility methods.
 */
declare module "connectivity" {
    /**
     * Gets the type of connection.
     * Returns a value from the connectivity.connectionType enumeration.
     * To use this method on Android you need to have the android.permission.ACCESS_NETWORK_STATE permission added to the AndroidManifest.xml file.
     */
    export function getConnectionType(): number;

    /**
     * Defines the different connection types.
     */
    export module connectionType {
        /**
         * Denotes no connection.
         */
        export var none: number;

        /**
         * Denotes a WiFi connection.
         */
        export var wifi: number;

        /**
         * Denotes a mobile connection, i.e. cellular network or WAN
         */
        export var mobile: number;
    }

    /**
     * Starts monitoring the connection type.
     * @param connectionChangedCallback A function that will be called when the connection type changes.
     */
    export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void;

    /**
     * Stops monitoring the connection type.
     */
    export function stopMonitoring(): void;
}