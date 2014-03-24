import types = require("Location/location_types");

export class LocationManager {

    public isLocationEnabled(): boolean {
        // TODO add proper implementation
        return true;
    }

    constructor() {

    }

    // in meters
    // we might need some predefined values here like 'any' and 'high'
    public desiredAccuracy: number;

    // listeners
    public locationChangeListener: types.LocationChangeListener;

    // monitoring

    public startLocationMonitoring() {

    }

    public stopLocationMonitoring() {

    }

    // other

    public getLastKnownLocation(): types.LocationPoint {
        return null;
    }

    public distanceInMeters(loc1: types.LocationPoint, loc2: types.LocationPoint): number {
        return 0;
    }
}