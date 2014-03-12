import types = require("Location/location_types");

export module tk {
    export module location {
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
            public locationChangeListener: types.tk.location.LocationChangeListener;

            // monitoring

            public startLocationMonitoring() {

            }

            public stopLocationMonitoring() {

            }

            // other

            public getLastKnownLocation(): types.tk.location.LocationPoint {
                return null;
            }

            public distanceInMeters(loc1: types.tk.location.LocationPoint, loc2: types.tk.location.LocationPoint): number {
                return 0;
            }
        }
    }
}
