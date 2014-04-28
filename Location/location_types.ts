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

export declare class Options {
    /**
    * Specifies desired accuracy in meters. Defaults to DesiredAccuracy.HIGH
    */
    public desiredAccuracy: number;

    /**
    * Update distance filter in meters. Specifies how often to update. Default on iOS is no filter, on Android it is 0 meters
    */
    public updateDistance: number;

    /**
    * Minimum time interval between location updates, in milliseconds (ignored on iOS)
    */
    public minimumUpdateTime: number;
}

export class LocationRegion {
    public latitude: number;
    public longitude: number;

    public raduis: number; // radius in meters
}
