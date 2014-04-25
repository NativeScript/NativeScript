export enum DesiredAccuracy {
    // in meters
    ANY = 300,
    HIGH = 3,
}

export class Location {
    public latitude: number;
    public longitude: number;

    public altitude: number;

    public horizontalAccuracy: number;
    public verticalAccuracy: number;

    public speed: number; // in m/s ?

    public direction: number; // in degrees

    public timestamp: Date;

    public androidNative: any;  // android Location
    public iosNative: any;      // iOS native location
}

export class LocationRegion {
    public latitude: number;
    public longitude: number;

    public raduis: number; // radius in meters
}

// TODO: This might be implemented with two callbacks, no need of special type.
export class RegionChangeListener {
    onRegionEnter(region: LocationRegion) {
    }
    onRegionExit(region: LocationRegion) {
    }
}
