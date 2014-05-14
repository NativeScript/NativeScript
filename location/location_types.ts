export enum Accuracy {
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

    public android: any;  // android Location
    public ios: any;      // iOS native location
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

export class LocationRegion {
    public latitude: number;
    public longitude: number;

    public raduis: number; // radius in meters
}
