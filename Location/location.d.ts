export declare enum DesiredAccuracy {
    // in meters
    ANY,
    HIGH,
}

export declare class LocationRegion {
    public latitude: number;
    public longitude: number;

    public raduis: number; // radius in meters
}

export declare class Location {
    latitude: number;
    longitude: number;

    altitude: number;

    horizontalAccuracy: number;
    verticalAccuracy: number;

    speed: number; // in m/s ?

    direction: number; // in degrees

    timestamp: Date;

    public androidNative: any;  // android Location
    public iosNative: any;      // iOS native location
}

export declare class RegionChangeListener {
    onRegionEnter(region: LocationRegion);
    onRegionExit(region: LocationRegion);
}

export declare class LocationManager {
    static isLocationEnabled(): boolean;
    static distanceInMeters(loc1: Location, loc2: Location): number;

    desiredAccuracy: number;
    updateDistance: number;
    // minimum time interval between location updates, in milliseconds (android only)
    minimumUpdateTime: number;
    isStarted: boolean;

    // monitoring
    startLocationMonitoring(onLocation: (location: Location) => any, onError?: (error: Error) => any);
    stopLocationMonitoring();

    // other
    getLastKnownLocation(): Location;
}