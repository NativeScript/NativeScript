/**
 * Contains connectivity utility methods.
 */
declare module "connectivity" {
    /**
     * Gets the type of connection.
     * Returns a value from the connectivity.connectionType enumeration.
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
}