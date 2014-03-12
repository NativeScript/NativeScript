export declare module tk {
    export module location {
        export enum DesiredAccuracy {
            // in meters
            ANY,
            HIGH,
        }

        export class LocationPoint {
            public latitude: number;
            public longitude: number;

            public altitude: number;

            public horizontalAccuracy: number;
            public verticalAccuracy: number;

            public speed: number; // in m/s ?

            public direction: number; // in degrees

            public timestamp: any;
        }

        export class LocationRegion {
            public latitude: number;
            public longitude: number;

            public raduis: number; // radius in meters
        }

        export class LocationChangeListener {
            onLocationChange(location: Location);
        }

        export class RegionChangeListener {
            onRegionEnter(region: LocationRegion);
            onRegionExit(region: LocationRegion);
        }

        export class LocationManager {
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
    }
}