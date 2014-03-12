import types_module = require("Location/location_types");
import app_module = require("Application/application");

export module tk {
    export module location {
        export class LocationManager {

            //public regions: LocationRegion[];

            private _locationManager: any;
            private _locationListener: android.location.LocationListener;

            public isLocationEnabled(): boolean {
                // TODO add proper implementation
                return true;
            }

            constructor() {
                //this.regions = [];
                this.desiredAccuracy = types_module.tk.location.DesiredAccuracy.ANY;
                this._locationManager = app_module.tk.ui.Application.current.android.context.getSystemService('location');
                Log('location manager: ' + this._locationManager);

                this._locationListener = new android.location.LocationListener({
                    onLocationChanged: function (location: android.location.Location) {
                    },

                    onProviderDisabled: function (provider: string) {
                    },

                    onProviderEnabled: function (provider: string) {
                    }
                });
            }

            // in meters
            // we might need some predefined values here like 'any' and 'high'
            public desiredAccuracy: number;

            // listeners
            public locationChangeListener: types_module.tk.location.LocationChangeListener;

            //              public regionChangeListener: RegionChangeListener;


            /*           // regions
                           public addRegion(region: LocationRegion) {
                               this.regions.push(region);
                           }

                           public removeRegion(region: LocationRegion) {

                           }

                           public clearRegions() {

                           }*/

            // monitoring

            public startLocationMonitoring() {
                var criteria = new android.location.Criteria();
                criteria.setAccuracy((this.desiredAccuracy === types_module.tk.location.DesiredAccuracy.HIGH) ? 3 : 1);
                var providers = this._locationManager.getProviders(criteria, false);
                var it = providers.iterator();
                while (it.hasNext()) {
                    var element = it.next();
                    Log('found provider: ' + element);
                    this._locationManager.requestLocationUpdates(element, 200, 10, this._locationListener);
                }
            }

            public stopLocationMonitoring() {
                this._locationManager.removeUpdates(this._locationListener);
            }

            // other

            public getLastKnownLocation(): types_module.tk.location.LocationPoint {
                return null;
            }

            public distanceInMeters(loc1: types_module.tk.location.LocationPoint, loc2: types_module.tk.location.LocationPoint): number {
                return 0;
            }
        }
    }
} 