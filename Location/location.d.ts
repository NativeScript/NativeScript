export declare enum DesiredAccuracy {
    // in meters
    ANY,
    HIGH,
}

export declare class LocationPoint {
    public latitude: number;
    public longitude: number;

    public altitude: number;

    public horizontalAccuracy: number;
    public verticalAccuracy: number;

    public speed: number; // in m/s ?

    public direction: number; // in degrees

    public timestamp: any;
}

export declare class LocationRegion {
    public latitude: number;
    public longitude: number;

    public raduis: number; // radius in meters
}

export declare class LocationChangeListener {
    //onLocationChange(location: Location);
}

export declare class RegionChangeListener {
    onRegionEnter(region: LocationRegion);
    onRegionExit(region: LocationRegion);
}

export declare class LocationManager {
    isLocationEnabled(): boolean;
    desiredAccuracy: number;

    // listeners
    locationChangeListener: LocationChangeListener;
    /*            regionChangeListener: RegionChangeListener;

                // regions
                addRegion(region: LocationRegion);

                removeRegion(region: LocationRegion);

                clearRegions();*/

    // monitoring

    startLocationMonitoring();
    stopLocationMonitoring();

    // other
    getLastKnownLocation(): LocationPoint;
    distanceInMeters(loc1: LocationPoint, loc2: LocationPoint): number;
}