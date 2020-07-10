/**
 * Gets the type of connection.
 * Returns a value from the connectivity.connectionType enumeration.
 * To use this method on Android you need to have the android.permission.ACCESS_NETWORK_STATE permission added to the AndroidManifest.xml file.
 */
export function getConnectionType(): number;

/**
 * Defines the different connection types.
 */
export enum connectionType {
	/**
	 * Denotes no connection.
	 */
	none = 0,

	/**
	 * Denotes a WiFi connection.
	 */
	wifi = 1,

	/**
	 * Denotes a mobile connection, i.e. cellular network or WAN.
	 */
	mobile = 2,

	/**
	 * Denotes an ethernet connection
	 */
	ethernet = 3,

	/**
	 * Denotes a bluetooth connection
	 */
	bluetooth = 4,

	/**
	 * Denotes a vpn connection
	 */
	vpn = 5,
}

/**
 * Starts monitoring the connection type.
 * @param connectionTypeChangedCallback A function that will be called when the connection type changes.
 */
export function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void;

/**
 * Stops monitoring the connection type.
 */
export function stopMonitoring(): void;
