//@private
export declare class Location {
    latitude: number;
    longitude: number;

    altitude: number; // in meters

    horizontalAccuracy: number; // in meters
    verticalAccuracy: number; // in meters

    speed: number; // in m/s

    direction: number; // in degrees

    timestamp: Date;

    public android: any;  // android Location
    public ios: any;      // iOS CLLocation
}

export interface Options {
   /**
    * Specifies desired accuracy in meters. Defaults to DesiredAccuracy.HIGH
    */
    desiredAccuracy?: number;

   /**
    * Update distance filter in meters. Specifies how often to update. Default on iOS is no filter, on Android it is 0 meters
    */
    updateDistance?: number;

   /**
    * Minimum time interval between location updates, in milliseconds (ignored on iOS)
    */
    minimumUpdateTime?: number;

   /**
    * how old locations to receive in ms.
    */
    maximumAge?: number;

   /**
    * how long to wait for a location in ms.
    */
    timeout?: number;
}

export declare class LocationManager {
    /**
     * Report are location services switched ON for this device (on Android) or application (iOS)
     */
    static isEnabled(): boolean;

    /**
     * Measure distance in meters between two locations
     */
    static distance(loc1: Location, loc2: Location): number;

    /**
     * Specifies desired accuracy in meters. Defaults to DesiredAccuracy.HIGH
     */
    desiredAccuracy: number;

    /**
     * Update distance filter in meters. Specifies how often to update. Default on iOS is no filter, on Android it is 0 meters
     */
    updateDistance: number;

    /**
     * Minimum time interval between location updates, in milliseconds (ignored on iOS)
     */
    minimumUpdateTime: number;

    // monitoring

    /**
     * Starts location monitoring.
     */
    startLocationMonitoring(onLocation: (location: Location) => any, onError?: (error: Error) => any, options?: Options);

    /**
     * Stops location monitoring
     */
    stopLocationMonitoring();

    // other

    /**
     * Returns last known location from device's location services or null of no known last location
     */
    lastKnownLocation: Location;
}
