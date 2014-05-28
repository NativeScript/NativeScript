
declare module "location" {
    import promises = require("promises");

    /**
    * Specifies common accuracy values.
    */
    enum Accuracy {
        /**
        * The default accuracy. About 300 meters.
        */
        ANY = 300,

        /**
        * High accuracy. About 3 meters.
        */
        HIGH = 3,
    }

    // For future usage
    //class LocationRegion {
    //    public latitude: number;
    //    public longitude: number;

    //    public raduis: number; // radius in meters
    //}

    /**
    * A data class that encapsulates common properties for a geolocation.
    */
    class Location {
        /**
        * The latitude of the geolocation, in degrees.
        */
        latitude: number;

        /**
        * The longitude of the geolocation, in degrees.
        */
        longitude: number;

        /**
        * The altitude (if available), in meters above sea level.
        */
        altitude: number;

        /**
        * The horizontal accuracy, in meters.
        */
        horizontalAccuracy: number;

        /**
        * The vertical accuracy, in meters.
        */
        verticalAccuracy: number;

        /**
        * The speed, in meters/second over ground.
        */
        speed: number;

        /**
        * The direction (course), in degrees.
        */
        direction: number;

        /**
        * The time at which this location was determined.
        */
        timestamp: Date;

        /**
        * The android-specific location object.
        */
        android: android.location.Location;

        /**
        * The ios-specific location object.
        */
        ios: CoreLocation.CLLocation;
    }

    /**
    * Provides options for location monitoring.
    */
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

    /**
    * Provides methods for querying geolocation (in case available) on the target platform.
    */
    class LocationManager {
        /**
        * Checks whether the location services are switched ON for this device (on Android) or application (iOS).
        */
        static isEnabled(): boolean;

        /**
        * Measures the distance in meters between two locations.
        * @param loc1 The first location.
        * @param loc2 The second location.
        */
        static distance(loc1: Location, loc2: Location): number;

        /**
        * The desired accuracy in meters. Defaults to DesiredAccuracy.HIGH
        */
        desiredAccuracy: number;

        /**
        * The update distance filter in meters. Specifies how often to update. Default on iOS is no filter, on Android it is 0 meters.
        */
        updateDistance: number;

        /**
        * The minimum time interval between subsequent location updates, in milliseconds (ignored on iOS).
        */
        minimumUpdateTime: number;

        /**
        * True if the location listener is already started. In this case all other start requests will be ignored.
        */
        isStarted: boolean;

        /**
        * Starts location monitoring.
        * @param onLocation A function that will be called upon every location update received.
        * @param onError An optional error callback.
        * @param options An optional object specifying location update settings.
        */
        startLocationMonitoring(onLocation: (location: Location) => any, onError?: (error: Error) => any, options?: Options);

        /**
        * Stops location monitoring.
        */
        stopLocationMonitoring();

        /**
        * Returns last known location from device's location services or null of no known last location.
        */
        lastKnownLocation: Location;
    }

    /**
    * Fires a single shot location search. If you specify timeout in options, location search will fail on timeout. 
    * If you specify timeout = 0 it just requests the last known location.
    * However if you specify maximumAge and the location received is older it won't be received.
    * @param options An optional object specifying location update settings.
    */
    function getLocation(options?: Options): promises.Promise<Location>;
}