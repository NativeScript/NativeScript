
/**
 * @since 18.0
 */
declare class MKAddressFilter extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKAddressFilter; // inherited from NSObject

	static new(): MKAddressFilter; // inherited from NSObject

	static readonly filterExcludingAll: MKAddressFilter;

	static readonly filterIncludingAll: MKAddressFilter;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { excludingOptions: MKAddressFilterOption; });

	constructor(o: { includingOptions: MKAddressFilterOption; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	excludesOptions(options: MKAddressFilterOption): boolean;

	includesOptions(options: MKAddressFilterOption): boolean;

	initExcludingOptions(options: MKAddressFilterOption): this;

	initIncludingOptions(options: MKAddressFilterOption): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare const enum MKAddressFilterOption {

	Country = 1,

	AdministrativeArea = 2,

	SubAdministrativeArea = 4,

	Locality = 8,

	SubLocality = 16,

	PostalCode = 32
}

interface MKAnnotation extends NSObjectProtocol {

	coordinate: CLLocationCoordinate2D;

	subtitle?: string;

	title?: string;

	/**
	 * @since 4.0
	 */
	setCoordinate?(newCoordinate: CLLocationCoordinate2D): void;
}
declare var MKAnnotation: {

	prototype: MKAnnotation;
};

declare var MKAnnotationCalloutInfoDidChangeNotification: string;

/**
 * @since 3.0
 */
declare class MKAnnotationView extends UIView {

	static alloc(): MKAnnotationView; // inherited from NSObject

	static appearance(): MKAnnotationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKAnnotationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKAnnotationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKAnnotationView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKAnnotationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKAnnotationView; // inherited from UIAppearance

	static new(): MKAnnotationView; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	accessoryOffset: CGPoint;

	annotation: MKAnnotation;

	calloutOffset: CGPoint;

	canShowCallout: boolean;

	centerOffset: CGPoint;

	/**
	 * @since 11.0
	 */
	readonly clusterAnnotationView: MKAnnotationView;

	/**
	 * @since 11.0
	 */
	clusteringIdentifier: string;

	/**
	 * @since 11.0
	 */
	collisionMode: MKAnnotationViewCollisionMode;

	/**
	 * @since 9.0
	 */
	detailCalloutAccessoryView: UIView;

	/**
	 * @since 11.0
	 */
	displayPriority: number;

	/**
	 * @since 4.0
	 */
	dragState: MKAnnotationViewDragState;

	/**
	 * @since 4.0
	 */
	draggable: boolean;

	enabled: boolean;

	highlighted: boolean;

	image: UIImage;

	leftCalloutAccessoryView: UIView;

	readonly reuseIdentifier: string;

	rightCalloutAccessoryView: UIView;

	selected: boolean;

	/**
	 * @since 14.0
	 */
	selectedZPriority: number;

	/**
	 * @since 14.0
	 */
	zPriority: number;

	constructor(o: { annotation: MKAnnotation; reuseIdentifier: string; });

	initWithAnnotationReuseIdentifier(annotation: MKAnnotation, reuseIdentifier: string): this;

	/**
	 * @since 11.0
	 */
	prepareForDisplay(): void;

	prepareForReuse(): void;

	/**
	 * @since 4.2
	 */
	setDragStateAnimated(newDragState: MKAnnotationViewDragState, animated: boolean): void;

	setSelectedAnimated(selected: boolean, animated: boolean): void;
}

/**
 * @since 11.0
 */
declare const enum MKAnnotationViewCollisionMode {

	Rectangle = 0,

	Circle = 1,

	None = 2
}

/**
 * @since 4.0
 */
declare const enum MKAnnotationViewDragState {

	None = 0,

	Starting = 1,

	Dragging = 2,

	Canceling = 3,

	Ending = 4
}

/**
 * @since 14.0
 */
declare var MKAnnotationViewZPriorityDefaultSelected: number;

/**
 * @since 14.0
 */
declare var MKAnnotationViewZPriorityDefaultUnselected: number;

/**
 * @since 14.0
 */
declare var MKAnnotationViewZPriorityMax: number;

/**
 * @since 14.0
 */
declare var MKAnnotationViewZPriorityMin: number;

/**
 * @since 4.0
 */
declare class MKCircle extends MKShape implements MKOverlay {

	static alloc(): MKCircle; // inherited from NSObject

	static circleWithCenterCoordinateRadius(coord: CLLocationCoordinate2D, radius: number): MKCircle;

	static circleWithMapRect(mapRect: MKMapRect): MKCircle;

	static new(): MKCircle; // inherited from NSObject

	readonly radius: number;

	readonly boundingMapRect: MKMapRect; // inherited from MKOverlay

	readonly canReplaceMapContent: boolean; // inherited from MKOverlay

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intersectsMapRect(mapRect: MKMapRect): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 7.0
 */
declare class MKCircleRenderer extends MKOverlayPathRenderer {

	static alloc(): MKCircleRenderer; // inherited from NSObject

	static new(): MKCircleRenderer; // inherited from NSObject

	readonly circle: MKCircle;

	/**
	 * @since 14.0
	 */
	strokeEnd: number;

	/**
	 * @since 14.0
	 */
	strokeStart: number;

	constructor(o: { circle: MKCircle; });

	initWithCircle(circle: MKCircle): this;
}

/**
 * @since 4.0
 * @deprecated 13.0
 */
declare class MKCircleView extends MKOverlayPathView {

	static alloc(): MKCircleView; // inherited from NSObject

	static appearance(): MKCircleView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKCircleView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKCircleView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCircleView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKCircleView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCircleView; // inherited from UIAppearance

	static new(): MKCircleView; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	readonly circle: MKCircle;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	constructor(o: { circle: MKCircle; });

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	initWithCircle(circle: MKCircle): this;
}

/**
 * @since 11.0
 */
declare class MKClusterAnnotation extends NSObject implements MKAnnotation {

	static alloc(): MKClusterAnnotation; // inherited from NSObject

	static new(): MKClusterAnnotation; // inherited from NSObject

	readonly memberAnnotations: NSArray<MKAnnotation>;

	subtitle: string;

	title: string;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { memberAnnotations: NSArray<MKAnnotation> | MKAnnotation[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithMemberAnnotations(memberAnnotations: NSArray<MKAnnotation> | MKAnnotation[]): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 11
 */
declare class MKCompassButton extends UIView {

	static alloc(): MKCompassButton; // inherited from NSObject

	static appearance(): MKCompassButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKCompassButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKCompassButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCompassButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKCompassButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCompassButton; // inherited from UIAppearance

	static compassButtonWithMapView(mapView: MKMapView): MKCompassButton;

	static new(): MKCompassButton; // inherited from NSObject

	compassVisibility: MKFeatureVisibility;

	mapView: MKMapView;
}

/**
 * @since 4.0
 */
declare function MKCoordinateForMapPoint(mapPoint: MKMapPoint): CLLocationCoordinate2D;

interface MKCoordinateRegion {
	center: CLLocationCoordinate2D;
	span: MKCoordinateSpan;
}
declare var MKCoordinateRegion: interop.StructType<MKCoordinateRegion>;

/**
 * @since 4.0
 */
declare function MKCoordinateRegionForMapRect(rect: MKMapRect): MKCoordinateRegion;

declare function MKCoordinateRegionMakeWithDistance(centerCoordinate: CLLocationCoordinate2D, latitudinalMeters: number, longitudinalMeters: number): MKCoordinateRegion;

interface MKCoordinateSpan {
	latitudeDelta: number;
	longitudeDelta: number;
}
declare var MKCoordinateSpan: interop.StructType<MKCoordinateSpan>;

/**
 * @since 7.0
 */
declare class MKDirections extends NSObject {

	static alloc(): MKDirections; // inherited from NSObject

	static new(): MKDirections; // inherited from NSObject

	readonly calculating: boolean;

	constructor(o: { request: MKDirectionsRequest; });

	calculateDirectionsWithCompletionHandler(completionHandler: (p1: MKDirectionsResponse, p2: NSError) => void): void;

	calculateETAWithCompletionHandler(completionHandler: (p1: MKETAResponse, p2: NSError) => void): void;

	cancel(): void;

	initWithRequest(request: MKDirectionsRequest): this;
}

/**
 * @since 6.0
 */
declare class MKDirectionsRequest extends NSObject {

	static alloc(): MKDirectionsRequest; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static isDirectionsRequestURL(url: NSURL): boolean;

	static new(): MKDirectionsRequest; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	arrivalDate: Date;

	/**
	 * @since 7.0
	 */
	departureDate: Date;

	destination: MKMapItem;

	/**
	 * @since 16.0
	 */
	highwayPreference: MKDirectionsRoutePreference;

	/**
	 * @since 7.0
	 */
	requestsAlternateRoutes: boolean;

	source: MKMapItem;

	/**
	 * @since 16.0
	 */
	tollPreference: MKDirectionsRoutePreference;

	/**
	 * @since 7.0
	 */
	transportType: MKDirectionsTransportType;

	/**
	 * @since 6.0
	 */
	constructor(o: { contentsOfURL: NSURL; });

	/**
	 * @since 6.0
	 */
	initWithContentsOfURL(url: NSURL): this;

	/**
	 * @since 7.0
	 */
	setDestination(destination: MKMapItem): void;

	/**
	 * @since 7.0
	 */
	setSource(source: MKMapItem): void;
}

/**
 * @since 7.0
 */
declare class MKDirectionsResponse extends NSObject {

	static alloc(): MKDirectionsResponse; // inherited from NSObject

	static new(): MKDirectionsResponse; // inherited from NSObject

	readonly destination: MKMapItem;

	readonly routes: NSArray<MKRoute>;

	readonly source: MKMapItem;
}

declare const enum MKDirectionsRoutePreference {

	Any = 0,

	Avoid = 1
}

/**
 * @since 7.0
 */
declare const enum MKDirectionsTransportType {

	Automobile = 1,

	Walking = 2,

	Transit = 4,

	Any = 268435455
}

/**
 * @since 7.0
 */
declare class MKDistanceFormatter extends NSFormatter {

	static alloc(): MKDistanceFormatter; // inherited from NSObject

	static new(): MKDistanceFormatter; // inherited from NSObject

	locale: NSLocale;

	unitStyle: MKDistanceFormatterUnitStyle;

	units: MKDistanceFormatterUnits;

	distanceFromString(distance: string): number;

	stringFromDistance(distance: number): string;
}

/**
 * @since 7.0
 */
declare const enum MKDistanceFormatterUnitStyle {

	Default = 0,

	Abbreviated = 1,

	Full = 2
}

/**
 * @since 7.0
 */
declare const enum MKDistanceFormatterUnits {

	Default = 0,

	Metric = 1,

	Imperial = 2,

	ImperialWithYards = 3
}

/**
 * @since 7.0
 */
declare class MKETAResponse extends NSObject {

	static alloc(): MKETAResponse; // inherited from NSObject

	static new(): MKETAResponse; // inherited from NSObject

	readonly destination: MKMapItem;

	/**
	 * @since 9.0
	 */
	readonly distance: number;

	/**
	 * @since 9.0
	 */
	readonly expectedArrivalDate: Date;

	/**
	 * @since 9.0
	 */
	readonly expectedDepartureDate: Date;

	readonly expectedTravelTime: number;

	readonly source: MKMapItem;

	/**
	 * @since 9.0
	 */
	readonly transportType: MKDirectionsTransportType;
}

/**
 * @since 3.0
 */
declare const enum MKErrorCode {

	Unknown = 1,

	ServerFailure = 2,

	LoadingThrottled = 3,

	PlacemarkNotFound = 4,

	DirectionsNotFound = 5,

	DecodingFailed = 6
}

declare var MKErrorDomain: string;

/**
 * @since 11.0
 */
declare var MKFeatureDisplayPriorityDefaultHigh: number;

/**
 * @since 11.0
 */
declare var MKFeatureDisplayPriorityDefaultLow: number;

/**
 * @since 11.0
 */
declare var MKFeatureDisplayPriorityRequired: number;

/**
 * @since 11.0
 */
declare const enum MKFeatureVisibility {

	Adaptive = 0,

	Hidden = 1,

	Visible = 2
}

/**
 * @since 13.0
 */
declare class MKGeoJSONDecoder extends NSObject {

	static alloc(): MKGeoJSONDecoder; // inherited from NSObject

	static new(): MKGeoJSONDecoder; // inherited from NSObject

	geoJSONObjectsWithDataError(data: NSData): NSArray<MKGeoJSONObject>;
}

/**
 * @since 13.0
 */
declare class MKGeoJSONFeature extends NSObject implements MKGeoJSONObject {

	static alloc(): MKGeoJSONFeature; // inherited from NSObject

	static new(): MKGeoJSONFeature; // inherited from NSObject

	readonly geometry: NSArray<MKShape & MKGeoJSONObject>;

	readonly identifier: string;

	readonly properties: NSData;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 13.0
 */
interface MKGeoJSONObject extends NSObjectProtocol {
}
declare var MKGeoJSONObject: {

	prototype: MKGeoJSONObject;
};

/**
 * @since 7.0
 */
declare class MKGeodesicPolyline extends MKPolyline {

	static alloc(): MKGeodesicPolyline; // inherited from NSObject

	static new(): MKGeodesicPolyline; // inherited from NSObject

	static polylineWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MKGeodesicPolyline; // inherited from MKPolyline

	static polylineWithPointsCount(points: interop.Pointer | interop.Reference<MKMapPoint>, count: number): MKGeodesicPolyline; // inherited from MKPolyline
}

/**
 * @since 14.0
 */
declare class MKGradientPolylineRenderer extends MKPolylineRenderer {

	static alloc(): MKGradientPolylineRenderer; // inherited from NSObject

	static new(): MKGradientPolylineRenderer; // inherited from NSObject

	readonly colors: NSArray<UIColor>;

	readonly locations: NSArray<number>;

	setColorsAtLocations(colors: NSArray<UIColor> | UIColor[], locations: NSArray<number> | number[]): void;
}

/**
 * @since 16.0
 */
declare class MKHybridMapConfiguration extends MKMapConfiguration {

	static alloc(): MKHybridMapConfiguration; // inherited from NSObject

	static new(): MKHybridMapConfiguration; // inherited from NSObject

	pointOfInterestFilter: MKPointOfInterestFilter;

	showsTraffic: boolean;

	constructor(o: { elevationStyle: MKMapElevationStyle; });

	initWithElevationStyle(elevationStyle: MKMapElevationStyle): this;
}

/**
 * @since 16.0
 */
declare class MKIconStyle extends NSObject {

	static alloc(): MKIconStyle; // inherited from NSObject

	static new(): MKIconStyle; // inherited from NSObject

	readonly backgroundColor: UIColor;

	readonly image: UIImage;
}

/**
 * @since 16.0
 */
declare class MKImageryMapConfiguration extends MKMapConfiguration {

	static alloc(): MKImageryMapConfiguration; // inherited from NSObject

	static new(): MKImageryMapConfiguration; // inherited from NSObject

	constructor(o: { elevationStyle: MKMapElevationStyle; });

	initWithElevationStyle(elevationStyle: MKMapElevationStyle): this;
}

/**
 * @since 7.1
 */
declare var MKLaunchOptionsCameraKey: string;

/**
 * @since 10.0
 */
declare var MKLaunchOptionsDirectionsModeDefault: string;

/**
 * @since 6.0
 */
declare var MKLaunchOptionsDirectionsModeDriving: string;

/**
 * @since 6.0
 */
declare var MKLaunchOptionsDirectionsModeKey: string;

/**
 * @since 9.0
 */
declare var MKLaunchOptionsDirectionsModeTransit: string;

/**
 * @since 6.0
 */
declare var MKLaunchOptionsDirectionsModeWalking: string;

/**
 * @since 6.0
 */
declare var MKLaunchOptionsMapCenterKey: string;

/**
 * @since 6.0
 */
declare var MKLaunchOptionsMapSpanKey: string;

/**
 * @since 6.0
 */
declare var MKLaunchOptionsMapTypeKey: string;

/**
 * @since 6.0
 */
declare var MKLaunchOptionsShowsTrafficKey: string;

/**
 * @since 14.0
 */
declare class MKLocalPointsOfInterestRequest extends NSObject implements NSCopying {

	static alloc(): MKLocalPointsOfInterestRequest; // inherited from NSObject

	static new(): MKLocalPointsOfInterestRequest; // inherited from NSObject

	readonly coordinate: CLLocationCoordinate2D;

	pointOfInterestFilter: MKPointOfInterestFilter;

	readonly radius: number;

	readonly region: MKCoordinateRegion;

	constructor(o: { centerCoordinate: CLLocationCoordinate2D; radius: number; });

	constructor(o: { coordinateRegion: MKCoordinateRegion; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCenterCoordinateRadius(coordinate: CLLocationCoordinate2D, radius: number): this;

	initWithCoordinateRegion(region: MKCoordinateRegion): this;
}

/**
 * @since 6.1
 */
declare class MKLocalSearch extends NSObject {

	static alloc(): MKLocalSearch; // inherited from NSObject

	static new(): MKLocalSearch; // inherited from NSObject

	readonly searching: boolean;

	/**
	 * @since 14.0
	 */
	constructor(o: { pointsOfInterestRequest: MKLocalPointsOfInterestRequest; });

	constructor(o: { request: MKLocalSearchRequest; });

	cancel(): void;

	/**
	 * @since 14.0
	 */
	initWithPointsOfInterestRequest(request: MKLocalPointsOfInterestRequest): this;

	initWithRequest(request: MKLocalSearchRequest): this;

	startWithCompletionHandler(completionHandler: (p1: MKLocalSearchResponse, p2: NSError) => void): void;
}

/**
 * @since 9.3
 */
declare class MKLocalSearchCompleter extends NSObject {

	static alloc(): MKLocalSearchCompleter; // inherited from NSObject

	static new(): MKLocalSearchCompleter; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	addressFilter: MKAddressFilter;

	delegate: MKLocalSearchCompleterDelegate;

	/**
	 * @since 9.3
	 * @deprecated 13.0
	 */
	filterType: MKSearchCompletionFilterType;

	/**
	 * @since 13.0
	 */
	pointOfInterestFilter: MKPointOfInterestFilter;

	queryFragment: string;

	region: MKCoordinateRegion;

	/**
	 * @since 18.0
	 */
	regionPriority: MKLocalSearchRegionPriority;

	/**
	 * @since 13.0
	 */
	resultTypes: MKLocalSearchCompleterResultType;

	readonly results: NSArray<MKLocalSearchCompletion>;

	readonly searching: boolean;

	cancel(): void;
}

/**
 * @since 9.3
 */
interface MKLocalSearchCompleterDelegate extends NSObjectProtocol {

	completerDidFailWithError?(completer: MKLocalSearchCompleter, error: NSError): void;

	completerDidUpdateResults?(completer: MKLocalSearchCompleter): void;
}
declare var MKLocalSearchCompleterDelegate: {

	prototype: MKLocalSearchCompleterDelegate;
};

/**
 * @since 13.0
 */
declare const enum MKLocalSearchCompleterResultType {

	Address = 1,

	PointOfInterest = 2,

	Query = 4,

	PhysicalFeature = 8
}

/**
 * @since 9.3
 */
declare class MKLocalSearchCompletion extends NSObject {

	static alloc(): MKLocalSearchCompletion; // inherited from NSObject

	static new(): MKLocalSearchCompletion; // inherited from NSObject

	readonly subtitle: string;

	readonly subtitleHighlightRanges: NSArray<NSValue>;

	readonly title: string;

	readonly titleHighlightRanges: NSArray<NSValue>;
}

/**
 * @since 18.0
 */
declare const enum MKLocalSearchRegionPriority {

	Default = 0,

	Required = 1
}

/**
 * @since 6.1
 */
declare class MKLocalSearchRequest extends NSObject implements NSCopying {

	static alloc(): MKLocalSearchRequest; // inherited from NSObject

	static new(): MKLocalSearchRequest; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	addressFilter: MKAddressFilter;

	naturalLanguageQuery: string;

	/**
	 * @since 13.0
	 */
	pointOfInterestFilter: MKPointOfInterestFilter;

	region: MKCoordinateRegion;

	/**
	 * @since 18.0
	 */
	regionPriority: MKLocalSearchRegionPriority;

	/**
	 * @since 13.0
	 */
	resultTypes: MKLocalSearchResultType;

	/**
	 * @since 9.3
	 */
	constructor(o: { completion: MKLocalSearchCompletion; });

	/**
	 * @since 13.0
	 */
	constructor(o: { naturalLanguageQuery: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { naturalLanguageQuery: string; region: MKCoordinateRegion; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 9.3
	 */
	initWithCompletion(completion: MKLocalSearchCompletion): this;

	/**
	 * @since 13.0
	 */
	initWithNaturalLanguageQuery(naturalLanguageQuery: string): this;

	/**
	 * @since 13.0
	 */
	initWithNaturalLanguageQueryRegion(naturalLanguageQuery: string, region: MKCoordinateRegion): this;
}

/**
 * @since 6.1
 */
declare class MKLocalSearchResponse extends NSObject {

	static alloc(): MKLocalSearchResponse; // inherited from NSObject

	static new(): MKLocalSearchResponse; // inherited from NSObject

	readonly boundingRegion: MKCoordinateRegion;

	readonly mapItems: NSArray<MKMapItem>;
}

/**
 * @since 13.0
 */
declare const enum MKLocalSearchResultType {

	Address = 1,

	PointOfInterest = 2,

	PhysicalFeature = 4
}

/**
 * @since 16.0
 */
declare const enum MKLookAroundBadgePosition {

	TopLeading = 0,

	TopTrailing = 1,

	BottomTrailing = 2
}

/**
 * @since 16.0
 */
declare class MKLookAroundScene extends NSObject implements NSCopying {

	static alloc(): MKLookAroundScene; // inherited from NSObject

	static new(): MKLookAroundScene; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare class MKLookAroundSceneRequest extends NSObject {

	static alloc(): MKLookAroundSceneRequest; // inherited from NSObject

	static new(): MKLookAroundSceneRequest; // inherited from NSObject

	readonly cancelled: boolean;

	readonly coordinate: CLLocationCoordinate2D;

	readonly loading: boolean;

	readonly mapItem: MKMapItem;

	constructor(o: { coordinate: CLLocationCoordinate2D; });

	constructor(o: { mapItem: MKMapItem; });

	cancel(): void;

	getSceneWithCompletionHandler(completionHandler: (p1: MKLookAroundScene, p2: NSError) => void): void;

	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

	initWithMapItem(mapItem: MKMapItem): this;
}

/**
 * @since 16.0
 */
declare class MKLookAroundSnapshot extends NSObject {

	static alloc(): MKLookAroundSnapshot; // inherited from NSObject

	static new(): MKLookAroundSnapshot; // inherited from NSObject

	readonly image: UIImage;
}

/**
 * @since 16.0
 */
declare class MKLookAroundSnapshotOptions extends NSObject {

	static alloc(): MKLookAroundSnapshotOptions; // inherited from NSObject

	static new(): MKLookAroundSnapshotOptions; // inherited from NSObject

	pointOfInterestFilter: MKPointOfInterestFilter;

	size: CGSize;

	traitCollection: UITraitCollection;
}

/**
 * @since 16.0
 */
declare class MKLookAroundSnapshotter extends NSObject {

	static alloc(): MKLookAroundSnapshotter; // inherited from NSObject

	static new(): MKLookAroundSnapshotter; // inherited from NSObject

	readonly loading: boolean;

	constructor(o: { scene: MKLookAroundScene; options: MKLookAroundSnapshotOptions; });

	cancel(): void;

	getSnapshotWithCompletionHandler(completionHandler: (p1: MKLookAroundSnapshot, p2: NSError) => void): void;

	initWithSceneOptions(scene: MKLookAroundScene, options: MKLookAroundSnapshotOptions): this;
}

/**
 * @since 16.0
 */
declare class MKLookAroundViewController extends UIViewController implements NSCoding, NSSecureCoding {

	static alloc(): MKLookAroundViewController; // inherited from NSObject

	static new(): MKLookAroundViewController; // inherited from NSObject

	badgePosition: MKLookAroundBadgePosition;

	delegate: MKLookAroundViewControllerDelegate;

	navigationEnabled: boolean;

	pointOfInterestFilter: MKPointOfInterestFilter;

	scene: MKLookAroundScene;

	showsRoadLabels: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { scene: MKLookAroundScene; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithScene(scene: MKLookAroundScene): this;
}

/**
 * @since 16.0
 */
interface MKLookAroundViewControllerDelegate extends NSObjectProtocol {

	lookAroundViewControllerDidDismissFullScreen?(viewController: MKLookAroundViewController): void;

	lookAroundViewControllerDidPresentFullScreen?(viewController: MKLookAroundViewController): void;

	lookAroundViewControllerDidUpdateScene?(viewController: MKLookAroundViewController): void;

	lookAroundViewControllerWillDismissFullScreen?(viewController: MKLookAroundViewController): void;

	lookAroundViewControllerWillPresentFullScreen?(viewController: MKLookAroundViewController): void;

	lookAroundViewControllerWillUpdateScene?(viewController: MKLookAroundViewController): void;
}
declare var MKLookAroundViewControllerDelegate: {

	prototype: MKLookAroundViewControllerDelegate;
};

/**
 * @since 7.0
 */
declare class MKMapCamera extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKMapCamera; // inherited from NSObject

	static camera(): MKMapCamera;

	/**
	 * @since 9.0
	 */
	static cameraLookingAtCenterCoordinateFromDistancePitchHeading(centerCoordinate: CLLocationCoordinate2D, distance: number, pitch: number, heading: number): MKMapCamera;

	static cameraLookingAtCenterCoordinateFromEyeCoordinateEyeAltitude(centerCoordinate: CLLocationCoordinate2D, eyeCoordinate: CLLocationCoordinate2D, eyeAltitude: number): MKMapCamera;

	/**
	 * @since 16.0
	 */
	static cameraLookingAtMapItemForViewSizeAllowPitch(mapItem: MKMapItem, viewSize: CGSize, allowPitch: boolean): MKMapCamera;

	static new(): MKMapCamera; // inherited from NSObject

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	altitude: number;

	centerCoordinate: CLLocationCoordinate2D;

	/**
	 * @since 13.0
	 */
	centerCoordinateDistance: number;

	heading: number;

	pitch: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MKMapCameraBoundary extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKMapCameraBoundary; // inherited from NSObject

	static new(): MKMapCameraBoundary; // inherited from NSObject

	readonly mapRect: MKMapRect;

	readonly region: MKCoordinateRegion;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { coordinateRegion: MKCoordinateRegion; });

	constructor(o: { mapRect: MKMapRect; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCoordinateRegion(region: MKCoordinateRegion): this;

	initWithMapRect(mapRect: MKMapRect): this;
}

/**
 * @since 13.0
 */
declare var MKMapCameraZoomDefault: number;

/**
 * @since 13.0
 */
declare class MKMapCameraZoomRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKMapCameraZoomRange; // inherited from NSObject

	static new(): MKMapCameraZoomRange; // inherited from NSObject

	readonly maxCenterCoordinateDistance: number;

	readonly minCenterCoordinateDistance: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { maxCenterCoordinateDistance: number; });

	constructor(o: { minCenterCoordinateDistance: number; });

	constructor(o: { minCenterCoordinateDistance: number; maxCenterCoordinateDistance: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithMaxCenterCoordinateDistance(maxDistance: number): this;

	initWithMinCenterCoordinateDistance(minDistance: number): this;

	initWithMinCenterCoordinateDistanceMaxCenterCoordinateDistance(minDistance: number, maxDistance: number): this;
}

/**
 * @since 16.0
 */
declare class MKMapConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKMapConfiguration; // inherited from NSObject

	static new(): MKMapConfiguration; // inherited from NSObject

	elevationStyle: MKMapElevationStyle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum MKMapElevationStyle {

	Flat = 0,

	Realistic = 1
}

/**
 * @since 16.0
 */
declare class MKMapFeatureAnnotation extends NSObject implements MKAnnotation {

	static alloc(): MKMapFeatureAnnotation; // inherited from NSObject

	static new(): MKMapFeatureAnnotation; // inherited from NSObject

	readonly featureType: MKMapFeatureType;

	readonly iconStyle: MKIconStyle;

	readonly pointOfInterestCategory: string;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 16.0
 */
declare const enum MKMapFeatureOptions {

	PointsOfInterest = 1,

	Territories = 2,

	PhysicalFeatures = 4
}

/**
 * @since 16.0
 */
declare const enum MKMapFeatureType {

	PointOfInterest = 0,

	Territory = 1,

	PhysicalFeature = 2
}

/**
 * @since 6.0
 */
declare class MKMapItem extends NSObject implements NSItemProviderReading, NSItemProviderWriting, NSSecureCoding {

	static alloc(): MKMapItem; // inherited from NSObject

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static mapItemForCurrentLocation(): MKMapItem;

	static new(): MKMapItem; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): MKMapItem;

	static openMapsWithItemsLaunchOptions(mapItems: NSArray<MKMapItem> | MKMapItem[], launchOptions: NSDictionary<string, any>): boolean;

	/**
	 * @since 13.2
	 */
	static openMapsWithItemsLaunchOptionsFromSceneCompletionHandler(mapItems: NSArray<MKMapItem> | MKMapItem[], launchOptions: NSDictionary<string, any>, scene: UIScene, completion: (p1: boolean) => void): void;

	/**
	 * @since 18.0
	 */
	readonly alternateIdentifiers: NSSet<MKMapItemIdentifier>;

	/**
	 * @since 18.0
	 */
	readonly identifier: MKMapItemIdentifier;

	readonly isCurrentLocation: boolean;

	name: string;

	phoneNumber: string;

	readonly placemark: MKPlacemark;

	/**
	 * @since 13.0
	 */
	pointOfInterestCategory: string;

	/**
	 * @since 9.0
	 */
	timeZone: NSTimeZone;

	url: NSURL;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { placemark: MKPlacemark; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPlacemark(placemark: MKPlacemark): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	openInMapsWithLaunchOptions(launchOptions: NSDictionary<string, any>): boolean;

	/**
	 * @since 13.2
	 */
	openInMapsWithLaunchOptionsFromSceneCompletionHandler(launchOptions: NSDictionary<string, any>, scene: UIScene, completion: (p1: boolean) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 18.0
 */
declare class MKMapItemAnnotation extends NSObject implements MKAnnotation {

	static alloc(): MKMapItemAnnotation; // inherited from NSObject

	static new(): MKMapItemAnnotation; // inherited from NSObject

	readonly mapItem: MKMapItem;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	constructor(o: { mapItem: MKMapItem; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithMapItem(mapItem: MKMapItem): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 18.0
 */
declare const enum MKMapItemDetailSelectionAccessoryCalloutStyle {

	Automatic = 0,

	Full = 1,

	Compact = 2
}

/**
 * @since 18.0
 */
declare class MKMapItemDetailSelectionAccessoryPresentationStyle extends NSObject {

	static alloc(): MKMapItemDetailSelectionAccessoryPresentationStyle; // inherited from NSObject

	static automaticWithPresentationViewController(presentationViewController: UIViewController): MKMapItemDetailSelectionAccessoryPresentationStyle;

	static calloutWithCalloutStyle(style: MKMapItemDetailSelectionAccessoryCalloutStyle): MKMapItemDetailSelectionAccessoryPresentationStyle;

	static new(): MKMapItemDetailSelectionAccessoryPresentationStyle; // inherited from NSObject

	static sheetPresentedFromViewController(viewController: UIViewController): MKMapItemDetailSelectionAccessoryPresentationStyle;

	static readonly callout: MKMapItemDetailSelectionAccessoryPresentationStyle;

	static readonly openInMaps: MKMapItemDetailSelectionAccessoryPresentationStyle;
}

/**
 * @since 18.0
 */
declare class MKMapItemDetailViewController extends UIViewController {

	static alloc(): MKMapItemDetailViewController; // inherited from NSObject

	static new(): MKMapItemDetailViewController; // inherited from NSObject

	delegate: MKMapItemDetailViewControllerDelegate;

	mapItem: MKMapItem;

	constructor(o: { mapItem: MKMapItem; });

	constructor(o: { mapItem: MKMapItem; displaysMap: boolean; });

	initWithMapItem(mapItem: MKMapItem): this;

	initWithMapItemDisplaysMap(mapItem: MKMapItem, displaysMap: boolean): this;
}

/**
 * @since 18.0
 */
interface MKMapItemDetailViewControllerDelegate extends NSObjectProtocol {

	mapItemDetailViewControllerDidFinish(detailViewController: MKMapItemDetailViewController): void;
}
declare var MKMapItemDetailViewControllerDelegate: {

	prototype: MKMapItemDetailViewControllerDelegate;
};

/**
 * @since 18.0
 */
declare class MKMapItemIdentifier extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKMapItemIdentifier; // inherited from NSObject

	static new(): MKMapItemIdentifier; // inherited from NSObject

	readonly identifierString: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifierString: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierString(string: string): this;
}

/**
 * @since 16.0
 */
declare class MKMapItemRequest extends NSObject {

	static alloc(): MKMapItemRequest; // inherited from NSObject

	static new(): MKMapItemRequest; // inherited from NSObject

	readonly cancelled: boolean;

	/**
	 * @since 16.0
	 * @deprecated 18.0
	 */
	readonly featureAnnotation: MKMapFeatureAnnotation;

	readonly loading: boolean;

	/**
	 * @since 18.0
	 */
	readonly mapFeatureAnnotation: MKMapFeatureAnnotation;

	/**
	 * @since 18.0
	 */
	readonly mapItemIdentifier: MKMapItemIdentifier;

	/**
	 * @since 16.0
	 */
	constructor(o: { mapFeatureAnnotation: MKMapFeatureAnnotation; });

	/**
	 * @since 18.0
	 */
	constructor(o: { mapItemIdentifier: MKMapItemIdentifier; });

	cancel(): void;

	getMapItemWithCompletionHandler(completionHandler: (p1: MKMapItem, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	initWithMapFeatureAnnotation(mapFeatureAnnotation: MKMapFeatureAnnotation): this;

	/**
	 * @since 18.0
	 */
	initWithMapItemIdentifier(identifier: MKMapItemIdentifier): this;
}

/**
 * @since 11.0
 */
declare var MKMapItemTypeIdentifier: string;

interface MKMapPoint {
	x: number;
	y: number;
}
declare var MKMapPoint: interop.StructType<MKMapPoint>;

/**
 * @since 4.0
 */
declare function MKMapPointForCoordinate(coordinate: CLLocationCoordinate2D): MKMapPoint;

/**
 * @since 4.0
 */
declare function MKMapPointsPerMeterAtLatitude(latitude: number): number;

interface MKMapRect {
	origin: MKMapPoint;
	size: MKMapSize;
}
declare var MKMapRect: interop.StructType<MKMapRect>;

/**
 * @since 4.0
 */
declare function MKMapRectContainsPoint(rect: MKMapRect, point: MKMapPoint): boolean;

/**
 * @since 4.0
 */
declare function MKMapRectContainsRect(rect1: MKMapRect, rect2: MKMapRect): boolean;

/**
 * @since 4.0
 */
declare function MKMapRectDivide(rect: MKMapRect, slice: interop.Pointer | interop.Reference<MKMapRect>, remainder: interop.Pointer | interop.Reference<MKMapRect>, amount: number, edge: CGRectEdge): void;

/**
 * @since 4.0
 */
declare function MKMapRectInset(rect: MKMapRect, dx: number, dy: number): MKMapRect;

/**
 * @since 4.0
 */
declare function MKMapRectIntersection(rect1: MKMapRect, rect2: MKMapRect): MKMapRect;

/**
 * @since 4.0
 */
declare function MKMapRectIntersectsRect(rect1: MKMapRect, rect2: MKMapRect): boolean;

/**
 * @since 4.0
 */
declare var MKMapRectNull: MKMapRect;

/**
 * @since 4.0
 */
declare function MKMapRectOffset(rect: MKMapRect, dx: number, dy: number): MKMapRect;

/**
 * @since 4.0
 */
declare function MKMapRectRemainder(rect: MKMapRect): MKMapRect;

/**
 * @since 4.0
 */
declare function MKMapRectSpans180thMeridian(rect: MKMapRect): boolean;

/**
 * @since 4.0
 */
declare function MKMapRectUnion(rect1: MKMapRect, rect2: MKMapRect): MKMapRect;

/**
 * @since 4.0
 */
declare var MKMapRectWorld: MKMapRect;

interface MKMapSize {
	width: number;
	height: number;
}
declare var MKMapSize: interop.StructType<MKMapSize>;

/**
 * @since 4.0
 */
declare var MKMapSizeWorld: MKMapSize;

/**
 * @since 7.0
 */
declare class MKMapSnapshot extends NSObject {

	static alloc(): MKMapSnapshot; // inherited from NSObject

	static new(): MKMapSnapshot; // inherited from NSObject

	readonly image: UIImage;

	/**
	 * @since 13.0
	 */
	readonly traitCollection: UITraitCollection;

	pointForCoordinate(coordinate: CLLocationCoordinate2D): CGPoint;
}

/**
 * @since 7.0
 */
declare class MKMapSnapshotOptions extends NSObject implements NSCopying {

	static alloc(): MKMapSnapshotOptions; // inherited from NSObject

	static new(): MKMapSnapshotOptions; // inherited from NSObject

	camera: MKMapCamera;

	mapRect: MKMapRect;

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	mapType: MKMapType;

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	pointOfInterestFilter: MKPointOfInterestFilter;

	/**
	 * @since 17.0
	 */
	preferredConfiguration: MKMapConfiguration;

	region: MKCoordinateRegion;

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	scale: number;

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	showsBuildings: boolean;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	showsPointsOfInterest: boolean;

	size: CGSize;

	/**
	 * @since 13.0
	 */
	traitCollection: UITraitCollection;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 7.0
 */
declare class MKMapSnapshotter extends NSObject {

	static alloc(): MKMapSnapshotter; // inherited from NSObject

	static new(): MKMapSnapshotter; // inherited from NSObject

	readonly loading: boolean;

	constructor(o: { options: MKMapSnapshotOptions; });

	cancel(): void;

	initWithOptions(options: MKMapSnapshotOptions): this;

	startWithCompletionHandler(completionHandler: (p1: MKMapSnapshot, p2: NSError) => void): void;

	startWithQueueCompletionHandler(queue: NSObject & OS_dispatch_queue, completionHandler: (p1: MKMapSnapshot, p2: NSError) => void): void;
}

/**
 * @since 3.0
 */
declare const enum MKMapType {

	Standard = 0,

	Satellite = 1,

	Hybrid = 2,

	SatelliteFlyover = 3,

	HybridFlyover = 4,

	MutedStandard = 5
}

/**
 * @since 3.0
 */
declare class MKMapView extends UIView implements NSCoding {

	static alloc(): MKMapView; // inherited from NSObject

	static appearance(): MKMapView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKMapView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKMapView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKMapView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKMapView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKMapView; // inherited from UIAppearance

	static new(): MKMapView; // inherited from NSObject

	readonly annotationVisibleRect: CGRect;

	readonly annotations: NSArray<MKAnnotation>;

	/**
	 * @since 7.0
	 */
	camera: MKMapCamera;

	/**
	 * @since 13.0
	 */
	cameraBoundary: MKMapCameraBoundary;

	/**
	 * @since 13.0
	 */
	cameraZoomRange: MKMapCameraZoomRange;

	centerCoordinate: CLLocationCoordinate2D;

	delegate: MKMapViewDelegate;

	/**
	 * @since 3.0
	 * @deprecated 100000
	 */
	mapType: MKMapType;

	/**
	 * @since 4.0
	 */
	readonly overlays: NSArray<MKOverlay>;

	/**
	 * @since 17.0
	 */
	pitchButtonVisibility: MKFeatureVisibility;

	/**
	 * @since 7.0
	 */
	pitchEnabled: boolean;

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	pointOfInterestFilter: MKPointOfInterestFilter;

	/**
	 * @since 16.0
	 */
	preferredConfiguration: MKMapConfiguration;

	region: MKCoordinateRegion;

	/**
	 * @since 7.0
	 */
	rotateEnabled: boolean;

	scrollEnabled: boolean;

	/**
	 * @since 16.0
	 */
	selectableMapFeatures: MKMapFeatureOptions;

	selectedAnnotations: NSArray<MKAnnotation>;

	/**
	 * @since 7.0
	 * @deprecated 100000
	 */
	showsBuildings: boolean;

	/**
	 * @since 9.0
	 */
	showsCompass: boolean;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	showsPointsOfInterest: boolean;

	/**
	 * @since 9.0
	 */
	showsScale: boolean;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	showsTraffic: boolean;

	showsUserLocation: boolean;

	/**
	 * @since 17.0
	 */
	showsUserTrackingButton: boolean;

	readonly userLocation: MKUserLocation;

	readonly userLocationVisible: boolean;

	/**
	 * @since 5.0
	 */
	userTrackingMode: MKUserTrackingMode;

	visibleMapRect: MKMapRect;

	zoomEnabled: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnnotation(annotation: MKAnnotation): void;

	addAnnotations(annotations: NSArray<MKAnnotation> | MKAnnotation[]): void;

	/**
	 * @since 4.0
	 */
	addOverlay(overlay: MKOverlay): void;

	/**
	 * @since 7.0
	 */
	addOverlayLevel(overlay: MKOverlay, level: MKOverlayLevel): void;

	/**
	 * @since 4.0
	 */
	addOverlays(overlays: NSArray<MKOverlay> | MKOverlay[]): void;

	/**
	 * @since 7.0
	 */
	addOverlaysLevel(overlays: NSArray<MKOverlay> | MKOverlay[], level: MKOverlayLevel): void;

	/**
	 * @since 4.2
	 */
	annotationsInMapRect(mapRect: MKMapRect): NSSet<MKAnnotation>;

	convertCoordinateToPointToView(coordinate: CLLocationCoordinate2D, view: UIView): CGPoint;

	convertPointToCoordinateFromView(point: CGPoint, view: UIView): CLLocationCoordinate2D;

	convertRectToRegionFromView(rect: CGRect, view: UIView): MKCoordinateRegion;

	convertRegionToRectToView(region: MKCoordinateRegion, view: UIView): CGRect;

	dequeueReusableAnnotationViewWithIdentifier(identifier: string): MKAnnotationView;

	/**
	 * @since 11.0
	 */
	dequeueReusableAnnotationViewWithIdentifierForAnnotation(identifier: string, annotation: MKAnnotation): MKAnnotationView;

	deselectAnnotationAnimated(annotation: MKAnnotation, animated: boolean): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	exchangeOverlayAtIndexWithOverlayAtIndex(index1: number, index2: number): void;

	/**
	 * @since 7.0
	 */
	exchangeOverlayWithOverlay(overlay1: MKOverlay, overlay2: MKOverlay): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 4.0
	 */
	insertOverlayAboveOverlay(overlay: MKOverlay, sibling: MKOverlay): void;

	/**
	 * @since 4.0
	 */
	insertOverlayAtIndex(overlay: MKOverlay, index: number): void;

	/**
	 * @since 7.0
	 */
	insertOverlayAtIndexLevel(overlay: MKOverlay, index: number, level: MKOverlayLevel): void;

	/**
	 * @since 4.0
	 */
	insertOverlayBelowOverlay(overlay: MKOverlay, sibling: MKOverlay): void;

	mapRectThatFits(mapRect: MKMapRect): MKMapRect;

	mapRectThatFitsEdgePadding(mapRect: MKMapRect, insets: UIEdgeInsets): MKMapRect;

	/**
	 * @since 7.0
	 */
	overlaysInLevel(level: MKOverlayLevel): NSArray<MKOverlay>;

	regionThatFits(region: MKCoordinateRegion): MKCoordinateRegion;

	/**
	 * @since 11.0
	 */
	registerClassForAnnotationViewWithReuseIdentifier(viewClass: typeof NSObject, identifier: string): void;

	removeAnnotation(annotation: MKAnnotation): void;

	removeAnnotations(annotations: NSArray<MKAnnotation> | MKAnnotation[]): void;

	/**
	 * @since 4.0
	 */
	removeOverlay(overlay: MKOverlay): void;

	/**
	 * @since 4.0
	 */
	removeOverlays(overlays: NSArray<MKOverlay> | MKOverlay[]): void;

	/**
	 * @since 7.0
	 */
	rendererForOverlay(overlay: MKOverlay): MKOverlayRenderer;

	selectAnnotationAnimated(annotation: MKAnnotation, animated: boolean): void;

	/**
	 * @since 7.0
	 */
	setCameraAnimated(camera: MKMapCamera, animated: boolean): void;

	/**
	 * @since 13.0
	 */
	setCameraBoundaryAnimated(cameraBoundary: MKMapCameraBoundary, animated: boolean): void;

	/**
	 * @since 13.0
	 */
	setCameraZoomRangeAnimated(cameraZoomRange: MKMapCameraZoomRange, animated: boolean): void;

	setCenterCoordinateAnimated(coordinate: CLLocationCoordinate2D, animated: boolean): void;

	setRegionAnimated(region: MKCoordinateRegion, animated: boolean): void;

	/**
	 * @since 5.0
	 */
	setUserTrackingModeAnimated(mode: MKUserTrackingMode, animated: boolean): void;

	setVisibleMapRectAnimated(mapRect: MKMapRect, animate: boolean): void;

	setVisibleMapRectEdgePaddingAnimated(mapRect: MKMapRect, insets: UIEdgeInsets, animate: boolean): void;

	/**
	 * @since 7.0
	 */
	showAnnotationsAnimated(annotations: NSArray<MKAnnotation> | MKAnnotation[], animated: boolean): void;

	viewForAnnotation(annotation: MKAnnotation): MKAnnotationView;

	/**
	 * @since 4.0
	 * @deprecated 13.0
	 */
	viewForOverlay(overlay: MKOverlay): MKOverlayView;
}

/**
 * @since 11.0
 */
declare var MKMapViewDefaultAnnotationViewReuseIdentifier: string;

/**
 * @since 11.0
 */
declare var MKMapViewDefaultClusterAnnotationViewReuseIdentifier: string;

interface MKMapViewDelegate extends NSObjectProtocol {

	mapViewAnnotationViewCalloutAccessoryControlTapped?(mapView: MKMapView, view: MKAnnotationView, control: UIControl): void;

	/**
	 * @since 4.0
	 */
	mapViewAnnotationViewDidChangeDragStateFromOldState?(mapView: MKMapView, view: MKAnnotationView, newState: MKAnnotationViewDragState, oldState: MKAnnotationViewDragState): void;

	/**
	 * @since 11.0
	 */
	mapViewClusterAnnotationForMemberAnnotations?(mapView: MKMapView, memberAnnotations: NSArray<MKAnnotation> | MKAnnotation[]): MKClusterAnnotation;

	mapViewDidAddAnnotationViews?(mapView: MKMapView, views: NSArray<MKAnnotationView> | MKAnnotationView[]): void;

	/**
	 * @since 7.0
	 */
	mapViewDidAddOverlayRenderers?(mapView: MKMapView, renderers: NSArray<MKOverlayRenderer> | MKOverlayRenderer[]): void;

	/**
	 * @since 4.0
	 * @deprecated 13.0
	 */
	mapViewDidAddOverlayViews?(mapView: MKMapView, overlayViews: NSArray<any> | any[]): void;

	/**
	 * @since 5.0
	 */
	mapViewDidChangeUserTrackingModeAnimated?(mapView: MKMapView, mode: MKUserTrackingMode, animated: boolean): void;

	/**
	 * @since 11
	 */
	mapViewDidChangeVisibleRegion?(mapView: MKMapView): void;

	/**
	 * @since 16.0
	 */
	mapViewDidDeselectAnnotation?(mapView: MKMapView, annotation: MKAnnotation): void;

	/**
	 * @since 4.0
	 */
	mapViewDidDeselectAnnotationView?(mapView: MKMapView, view: MKAnnotationView): void;

	mapViewDidFailLoadingMapWithError?(mapView: MKMapView, error: NSError): void;

	/**
	 * @since 4.0
	 */
	mapViewDidFailToLocateUserWithError?(mapView: MKMapView, error: NSError): void;

	mapViewDidFinishLoadingMap?(mapView: MKMapView): void;

	/**
	 * @since 7.0
	 */
	mapViewDidFinishRenderingMapFullyRendered?(mapView: MKMapView, fullyRendered: boolean): void;

	/**
	 * @since 16.0
	 */
	mapViewDidSelectAnnotation?(mapView: MKMapView, annotation: MKAnnotation): void;

	/**
	 * @since 4.0
	 */
	mapViewDidSelectAnnotationView?(mapView: MKMapView, view: MKAnnotationView): void;

	/**
	 * @since 4.0
	 */
	mapViewDidStopLocatingUser?(mapView: MKMapView): void;

	/**
	 * @since 4.0
	 */
	mapViewDidUpdateUserLocation?(mapView: MKMapView, userLocation: MKUserLocation): void;

	mapViewRegionDidChangeAnimated?(mapView: MKMapView, animated: boolean): void;

	mapViewRegionWillChangeAnimated?(mapView: MKMapView, animated: boolean): void;

	/**
	 * @since 7.0
	 */
	mapViewRendererForOverlay?(mapView: MKMapView, overlay: MKOverlay): MKOverlayRenderer;

	/**
	 * @since 18.0
	 */
	mapViewSelectionAccessoryForAnnotation?(mapView: MKMapView, annotation: MKAnnotation): MKSelectionAccessory;

	mapViewViewForAnnotation?(mapView: MKMapView, annotation: MKAnnotation): MKAnnotationView;

	/**
	 * @since 4.0
	 * @deprecated 13.0
	 */
	mapViewViewForOverlay?(mapView: MKMapView, overlay: MKOverlay): MKOverlayView;

	mapViewWillStartLoadingMap?(mapView: MKMapView): void;

	/**
	 * @since 4.0
	 */
	mapViewWillStartLocatingUser?(mapView: MKMapView): void;

	/**
	 * @since 7.0
	 */
	mapViewWillStartRenderingMap?(mapView: MKMapView): void;
}
declare var MKMapViewDelegate: {

	prototype: MKMapViewDelegate;
};

/**
 * @since 11.0
 */
declare class MKMarkerAnnotationView extends MKAnnotationView {

	static alloc(): MKMarkerAnnotationView; // inherited from NSObject

	static appearance(): MKMarkerAnnotationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKMarkerAnnotationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKMarkerAnnotationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKMarkerAnnotationView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKMarkerAnnotationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKMarkerAnnotationView; // inherited from UIAppearance

	static new(): MKMarkerAnnotationView; // inherited from NSObject

	animatesWhenAdded: boolean;

	glyphImage: UIImage;

	glyphText: string;

	glyphTintColor: UIColor;

	markerTintColor: UIColor;

	selectedGlyphImage: UIImage;

	subtitleVisibility: MKFeatureVisibility;

	titleVisibility: MKFeatureVisibility;
}

/**
 * @since 4.0
 */
declare function MKMetersBetweenMapPoints(a: MKMapPoint, b: MKMapPoint): number;

/**
 * @since 4.0
 */
declare function MKMetersPerMapPointAtLatitude(latitude: number): number;

/**
 * @since 4.0
 */
declare class MKMultiPoint extends MKShape implements MKGeoJSONObject {

	static alloc(): MKMultiPoint; // inherited from NSObject

	static new(): MKMultiPoint; // inherited from NSObject

	readonly pointCount: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	getCoordinatesRange(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, range: NSRange): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 14.0
	 */
	locationAtPointIndex(index: number): number;

	/**
	 * @since 14.0
	 */
	locationsAtPointIndexes(indexes: NSIndexSet): NSArray<number>;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	points(): interop.Pointer | interop.Reference<MKMapPoint>;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 13.0
 */
declare class MKMultiPolygon extends MKShape implements MKGeoJSONObject, MKOverlay {

	static alloc(): MKMultiPolygon; // inherited from NSObject

	static new(): MKMultiPolygon; // inherited from NSObject

	readonly polygons: NSArray<MKPolygon>;

	readonly boundingMapRect: MKMapRect; // inherited from MKOverlay

	readonly canReplaceMapContent: boolean; // inherited from MKOverlay

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	constructor(o: { polygons: NSArray<MKPolygon> | MKPolygon[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithPolygons(polygons: NSArray<MKPolygon> | MKPolygon[]): this;

	intersectsMapRect(mapRect: MKMapRect): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 13.0
 */
declare class MKMultiPolygonRenderer extends MKOverlayPathRenderer {

	static alloc(): MKMultiPolygonRenderer; // inherited from NSObject

	static new(): MKMultiPolygonRenderer; // inherited from NSObject

	readonly multiPolygon: MKMultiPolygon;

	constructor(o: { multiPolygon: MKMultiPolygon; });

	initWithMultiPolygon(multiPolygon: MKMultiPolygon): this;
}

/**
 * @since 13.0
 */
declare class MKMultiPolyline extends MKShape implements MKGeoJSONObject, MKOverlay {

	static alloc(): MKMultiPolyline; // inherited from NSObject

	static new(): MKMultiPolyline; // inherited from NSObject

	readonly polylines: NSArray<MKPolyline>;

	readonly boundingMapRect: MKMapRect; // inherited from MKOverlay

	readonly canReplaceMapContent: boolean; // inherited from MKOverlay

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	constructor(o: { polylines: NSArray<MKPolyline> | MKPolyline[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithPolylines(polylines: NSArray<MKPolyline> | MKPolyline[]): this;

	intersectsMapRect(mapRect: MKMapRect): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 13.0
 */
declare class MKMultiPolylineRenderer extends MKOverlayPathRenderer {

	static alloc(): MKMultiPolylineRenderer; // inherited from NSObject

	static new(): MKMultiPolylineRenderer; // inherited from NSObject

	readonly multiPolyline: MKMultiPolyline;

	constructor(o: { multiPolyline: MKMultiPolyline; });

	initWithMultiPolyline(multiPolyline: MKMultiPolyline): this;
}

/**
 * @since 4.0
 */
interface MKOverlay extends MKAnnotation {

	boundingMapRect: MKMapRect;

	canReplaceMapContent: boolean;

	intersectsMapRect?(mapRect: MKMapRect): boolean;
}
declare var MKOverlay: {

	prototype: MKOverlay;
};

/**
 * @since 7.0
 */
declare const enum MKOverlayLevel {

	AboveRoads = 0,

	AboveLabels = 1
}

/**
 * @since 7.0
 */
declare class MKOverlayPathRenderer extends MKOverlayRenderer {

	static alloc(): MKOverlayPathRenderer; // inherited from NSObject

	static new(): MKOverlayPathRenderer; // inherited from NSObject

	fillColor: UIColor;

	lineCap: CGLineCap;

	lineDashPattern: NSArray<number>;

	lineDashPhase: number;

	lineJoin: CGLineJoin;

	lineWidth: number;

	miterLimit: number;

	path: any;

	/**
	 * @since 13.0
	 */
	shouldRasterize: boolean;

	strokeColor: UIColor;

	applyFillPropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	applyStrokePropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	createPath(): void;

	fillPathInContext(path: any, context: any): void;

	invalidatePath(): void;

	strokePathInContext(path: any, context: any): void;
}

/**
 * @since 4.0
 * @deprecated 13.0
 */
declare class MKOverlayPathView extends MKOverlayView {

	static alloc(): MKOverlayPathView; // inherited from NSObject

	static appearance(): MKOverlayPathView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKOverlayPathView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKOverlayPathView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayPathView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKOverlayPathView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayPathView; // inherited from UIAppearance

	static new(): MKOverlayPathView; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	fillColor: UIColor;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	lineCap: CGLineCap;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	lineDashPattern: NSArray<any>;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	lineDashPhase: number;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	lineJoin: CGLineJoin;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	lineWidth: number;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	miterLimit: number;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	path: any;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	strokeColor: UIColor;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	applyFillPropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	applyStrokePropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	createPath(): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	fillPathInContext(path: any, context: any): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	invalidatePath(): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	strokePathInContext(path: any, context: any): void;
}

/**
 * @since 7.0
 */
declare class MKOverlayRenderer extends NSObject {

	static alloc(): MKOverlayRenderer; // inherited from NSObject

	static new(): MKOverlayRenderer; // inherited from NSObject

	alpha: number;

	/**
	 * @since 16.0
	 */
	blendMode: CGBlendMode;

	readonly contentScaleFactor: number;

	readonly overlay: MKOverlay;

	constructor(o: { overlay: MKOverlay; });

	canDrawMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): boolean;

	drawMapRectZoomScaleInContext(mapRect: MKMapRect, zoomScale: number, context: any): void;

	initWithOverlay(overlay: MKOverlay): this;

	mapPointForPoint(point: CGPoint): MKMapPoint;

	mapRectForRect(rect: CGRect): MKMapRect;

	pointForMapPoint(mapPoint: MKMapPoint): CGPoint;

	rectForMapRect(mapRect: MKMapRect): CGRect;

	setNeedsDisplay(): void;

	setNeedsDisplayInMapRect(mapRect: MKMapRect): void;

	setNeedsDisplayInMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): void;
}

/**
 * @since 4.0
 * @deprecated 13.0
 */
declare class MKOverlayView extends UIView {

	static alloc(): MKOverlayView; // inherited from NSObject

	static appearance(): MKOverlayView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKOverlayView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKOverlayView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKOverlayView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayView; // inherited from UIAppearance

	static new(): MKOverlayView; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	readonly overlay: MKOverlay;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	constructor(o: { overlay: MKOverlay; });

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	canDrawMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): boolean;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	drawMapRectZoomScaleInContext(mapRect: MKMapRect, zoomScale: number, context: any): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	initWithOverlay(overlay: MKOverlay): this;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	mapPointForPoint(point: CGPoint): MKMapPoint;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	mapRectForRect(rect: CGRect): MKMapRect;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	pointForMapPoint(mapPoint: MKMapPoint): CGPoint;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	rectForMapRect(mapRect: MKMapRect): CGRect;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	setNeedsDisplayInMapRect(mapRect: MKMapRect): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	setNeedsDisplayInMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): void;
}

/**
 * @since 3.0
 * @deprecated 9.0
 */
declare const enum MKPinAnnotationColor {

	Red = 0,

	Green = 1,

	Purple = 2
}

/**
 * @since 3.0
 * @deprecated 16.0
 */
declare class MKPinAnnotationView extends MKAnnotationView {

	static alloc(): MKPinAnnotationView; // inherited from NSObject

	static appearance(): MKPinAnnotationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKPinAnnotationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKPinAnnotationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPinAnnotationView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKPinAnnotationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPinAnnotationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static greenPinColor(): UIColor;

	static new(): MKPinAnnotationView; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static purplePinColor(): UIColor;

	/**
	 * @since 9.0
	 */
	static redPinColor(): UIColor;

	animatesDrop: boolean;

	/**
	 * @since 3.0
	 * @deprecated 9.0
	 */
	pinColor: MKPinAnnotationColor;

	/**
	 * @since 9.0
	 */
	pinTintColor: UIColor;
}

/**
 * @since 3.0
 */
declare class MKPlacemark extends CLPlacemark implements MKAnnotation {

	static alloc(): MKPlacemark; // inherited from NSObject

	static new(): MKPlacemark; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static placemarkWithLocationNamePostalAddress(location: CLLocation, name: string, postalAddress: CNPostalAddress): MKPlacemark; // inherited from CLPlacemark

	readonly countryCode: string;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 10.0
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; });

	constructor(o: { coordinate: CLLocationCoordinate2D; addressDictionary: NSDictionary<string, any>; });

	/**
	 * @since 10.0
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; postalAddress: CNPostalAddress; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 10.0
	 */
	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

	initWithCoordinateAddressDictionary(coordinate: CLLocationCoordinate2D, addressDictionary: NSDictionary<string, any>): this;

	/**
	 * @since 10.0
	 */
	initWithCoordinatePostalAddress(coordinate: CLLocationCoordinate2D, postalAddress: CNPostalAddress): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 4.0
 */
declare class MKPointAnnotation extends MKShape implements MKGeoJSONObject {

	static alloc(): MKPointAnnotation; // inherited from NSObject

	static new(): MKPointAnnotation; // inherited from NSObject

	coordinate: CLLocationCoordinate2D;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 13.0
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; });

	/**
	 * @since 13.0
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; title: string; subtitle: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 13.0
	 */
	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

	/**
	 * @since 13.0
	 */
	initWithCoordinateTitleSubtitle(coordinate: CLLocationCoordinate2D, title: string, subtitle: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryATM: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryAirport: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryAmusementPark: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryAnimalService: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryAquarium: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryAutomotiveRepair: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryBakery: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryBank: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryBaseball: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryBasketball: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryBeach: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryBeauty: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryBowling: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryBrewery: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryCafe: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryCampground: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryCarRental: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryCastle: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryConventionCenter: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryDistillery: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryEVCharger: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryFairground: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryFireStation: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryFishing: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryFitnessCenter: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryFoodMarket: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryFortress: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryGasStation: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryGoKart: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryGolf: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryHiking: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryHospital: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryHotel: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryKayaking: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryLandmark: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryLaundry: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryLibrary: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryMailbox: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryMarina: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryMiniGolf: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryMovieTheater: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryMuseum: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryMusicVenue: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryNationalMonument: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryNationalPark: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryNightlife: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryPark: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryParking: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryPharmacy: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryPlanetarium: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryPolice: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryPostOffice: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryPublicTransport: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryRVPark: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryRestaurant: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryRestroom: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryRockClimbing: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategorySchool: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategorySkatePark: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategorySkating: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategorySkiing: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategorySoccer: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategorySpa: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryStadium: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryStore: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategorySurfing: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategorySwimming: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryTennis: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryTheater: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryUniversity: string;

/**
 * @since 18.0
 */
declare var MKPointOfInterestCategoryVolleyball: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryWinery: string;

/**
 * @since 13.0
 */
declare var MKPointOfInterestCategoryZoo: string;

/**
 * @since 13.0
 */
declare class MKPointOfInterestFilter extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKPointOfInterestFilter; // inherited from NSObject

	static new(): MKPointOfInterestFilter; // inherited from NSObject

	static readonly filterExcludingAllCategories: MKPointOfInterestFilter;

	static readonly filterIncludingAllCategories: MKPointOfInterestFilter;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { excludingCategories: NSArray<string> | string[]; });

	constructor(o: { includingCategories: NSArray<string> | string[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	excludesCategory(category: string): boolean;

	includesCategory(category: string): boolean;

	initExcludingCategories(categories: NSArray<string> | string[]): this;

	initIncludingCategories(categories: NSArray<string> | string[]): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare var MKPointsOfInterestRequestMaxRadius: number;

/**
 * @since 4.0
 */
declare class MKPolygon extends MKMultiPoint implements MKGeoJSONObject, MKOverlay {

	static alloc(): MKPolygon; // inherited from NSObject

	static new(): MKPolygon; // inherited from NSObject

	static polygonWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MKPolygon;

	static polygonWithCoordinatesCountInteriorPolygons(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number, interiorPolygons: NSArray<MKPolygon> | MKPolygon[]): MKPolygon;

	static polygonWithPointsCount(points: interop.Pointer | interop.Reference<MKMapPoint>, count: number): MKPolygon;

	static polygonWithPointsCountInteriorPolygons(points: interop.Pointer | interop.Reference<MKMapPoint>, count: number, interiorPolygons: NSArray<MKPolygon> | MKPolygon[]): MKPolygon;

	readonly interiorPolygons: NSArray<MKPolygon>;

	readonly boundingMapRect: MKMapRect; // inherited from MKOverlay

	readonly canReplaceMapContent: boolean; // inherited from MKOverlay

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intersectsMapRect(mapRect: MKMapRect): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 7.0
 */
declare class MKPolygonRenderer extends MKOverlayPathRenderer {

	static alloc(): MKPolygonRenderer; // inherited from NSObject

	static new(): MKPolygonRenderer; // inherited from NSObject

	readonly polygon: MKPolygon;

	/**
	 * @since 14.0
	 */
	strokeEnd: number;

	/**
	 * @since 14.0
	 */
	strokeStart: number;

	constructor(o: { polygon: MKPolygon; });

	initWithPolygon(polygon: MKPolygon): this;
}

/**
 * @since 4.0
 * @deprecated 13.0
 */
declare class MKPolygonView extends MKOverlayPathView {

	static alloc(): MKPolygonView; // inherited from NSObject

	static appearance(): MKPolygonView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKPolygonView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKPolygonView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolygonView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKPolygonView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolygonView; // inherited from UIAppearance

	static new(): MKPolygonView; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	readonly polygon: MKPolygon;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	constructor(o: { polygon: MKPolygon; });

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	initWithPolygon(polygon: MKPolygon): this;
}

/**
 * @since 4.0
 */
declare class MKPolyline extends MKMultiPoint implements MKGeoJSONObject, MKOverlay {

	static alloc(): MKPolyline; // inherited from NSObject

	static new(): MKPolyline; // inherited from NSObject

	static polylineWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MKPolyline;

	static polylineWithPointsCount(points: interop.Pointer | interop.Reference<MKMapPoint>, count: number): MKPolyline;

	readonly boundingMapRect: MKMapRect; // inherited from MKOverlay

	readonly canReplaceMapContent: boolean; // inherited from MKOverlay

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	intersectsMapRect(mapRect: MKMapRect): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 7.0
 */
declare class MKPolylineRenderer extends MKOverlayPathRenderer {

	static alloc(): MKPolylineRenderer; // inherited from NSObject

	static new(): MKPolylineRenderer; // inherited from NSObject

	readonly polyline: MKPolyline;

	/**
	 * @since 14.0
	 */
	strokeEnd: number;

	/**
	 * @since 14.0
	 */
	strokeStart: number;

	constructor(o: { polyline: MKPolyline; });

	initWithPolyline(polyline: MKPolyline): this;
}

/**
 * @since 4.0
 * @deprecated 13.0
 */
declare class MKPolylineView extends MKOverlayPathView {

	static alloc(): MKPolylineView; // inherited from NSObject

	static appearance(): MKPolylineView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKPolylineView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKPolylineView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolylineView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKPolylineView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolylineView; // inherited from UIAppearance

	static new(): MKPolylineView; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	readonly polyline: MKPolyline;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	constructor(o: { polyline: MKPolyline; });

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	initWithPolyline(polyline: MKPolyline): this;
}

/**
 * @since 3.0
 * @deprecated 5.0
 */
declare class MKReverseGeocoder extends NSObject {

	static alloc(): MKReverseGeocoder; // inherited from NSObject

	static new(): MKReverseGeocoder; // inherited from NSObject

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	readonly coordinate: CLLocationCoordinate2D;

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	delegate: MKReverseGeocoderDelegate;

	/**
	 * @since 3.2
	 * @deprecated 5.0
	 */
	readonly placemark: MKPlacemark;

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	readonly querying: boolean;

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; });

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	cancel(): void;

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	start(): void;
}

/**
 * @since 3.0
 * @deprecated 5.0
 */
interface MKReverseGeocoderDelegate extends NSObjectProtocol {

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	reverseGeocoderDidFailWithError(geocoder: MKReverseGeocoder, error: NSError): void;

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	reverseGeocoderDidFindPlacemark(geocoder: MKReverseGeocoder, placemark: MKPlacemark): void;
}
declare var MKReverseGeocoderDelegate: {

	prototype: MKReverseGeocoderDelegate;
};

/**
 * @since 4.0
 */
declare function MKRoadWidthAtZoomScale(zoomScale: number): number;

/**
 * @since 4.0
 */
declare function MKRoadWidthAtZoomScaleFunction(zoomScale: number): number;

/**
 * @since 7.0
 */
declare class MKRoute extends NSObject {

	static alloc(): MKRoute; // inherited from NSObject

	static new(): MKRoute; // inherited from NSObject

	readonly advisoryNotices: NSArray<string>;

	readonly distance: number;

	readonly expectedTravelTime: number;

	/**
	 * @since 16.0
	 */
	readonly hasHighways: boolean;

	/**
	 * @since 16.0
	 */
	readonly hasTolls: boolean;

	readonly name: string;

	readonly polyline: MKPolyline;

	readonly steps: NSArray<MKRouteStep>;

	readonly transportType: MKDirectionsTransportType;
}

/**
 * @since 7.0
 */
declare class MKRouteStep extends NSObject {

	static alloc(): MKRouteStep; // inherited from NSObject

	static new(): MKRouteStep; // inherited from NSObject

	readonly distance: number;

	readonly instructions: string;

	readonly notice: string;

	readonly polyline: MKPolyline;

	readonly transportType: MKDirectionsTransportType;
}

/**
 * @since 11.0
 */
declare class MKScaleView extends UIView {

	static alloc(): MKScaleView; // inherited from NSObject

	static appearance(): MKScaleView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKScaleView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKScaleView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKScaleView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKScaleView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKScaleView; // inherited from UIAppearance

	static new(): MKScaleView; // inherited from NSObject

	static scaleViewWithMapView(mapView: MKMapView): MKScaleView;

	legendAlignment: MKScaleViewAlignment;

	mapView: MKMapView;

	scaleVisibility: MKFeatureVisibility;
}

/**
 * @since 11.0
 */
declare const enum MKScaleViewAlignment {

	Leading = 0,

	Trailing = 1
}

/**
 * @since 9.3
 * @deprecated 13.0
 */
declare const enum MKSearchCompletionFilterType {

	LocationsAndQueries = 0,

	LocationsOnly = 1
}

/**
 * @since 18.0
 */
declare class MKSelectionAccessory extends NSObject {

	static alloc(): MKSelectionAccessory; // inherited from NSObject

	static mapItemDetailWithPresentationStyle(presentationStyle: MKMapItemDetailSelectionAccessoryPresentationStyle): MKSelectionAccessory;

	static new(): MKSelectionAccessory; // inherited from NSObject
}

/**
 * @since 4.0
 */
declare class MKShape extends NSObject implements MKAnnotation {

	static alloc(): MKShape; // inherited from NSObject

	static new(): MKShape; // inherited from NSObject

	subtitle: string;

	title: string;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 16.0
 */
declare class MKStandardMapConfiguration extends MKMapConfiguration {

	static alloc(): MKStandardMapConfiguration; // inherited from NSObject

	static new(): MKStandardMapConfiguration; // inherited from NSObject

	emphasisStyle: MKStandardMapEmphasisStyle;

	pointOfInterestFilter: MKPointOfInterestFilter;

	showsTraffic: boolean;

	constructor(o: { elevationStyle: MKMapElevationStyle; });

	constructor(o: { elevationStyle: MKMapElevationStyle; emphasisStyle: MKStandardMapEmphasisStyle; });

	constructor(o: { emphasisStyle: MKStandardMapEmphasisStyle; });

	initWithElevationStyle(elevationStyle: MKMapElevationStyle): this;

	initWithElevationStyleEmphasisStyle(elevationStyle: MKMapElevationStyle, emphasisStyle: MKStandardMapEmphasisStyle): this;

	initWithEmphasisStyle(emphasisStyle: MKStandardMapEmphasisStyle): this;
}

declare const enum MKStandardMapEmphasisStyle {

	Default = 0,

	Muted = 1
}

/**
 * @since 7.0
 */
declare class MKTileOverlay extends NSObject implements MKOverlay {

	static alloc(): MKTileOverlay; // inherited from NSObject

	static new(): MKTileOverlay; // inherited from NSObject

	readonly URLTemplate: string;

	canReplaceMapContent: boolean;

	geometryFlipped: boolean;

	maximumZ: number;

	minimumZ: number;

	tileSize: CGSize;

	readonly boundingMapRect: MKMapRect; // inherited from MKOverlay

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly subtitle: string; // inherited from MKAnnotation

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly title: string; // inherited from MKAnnotation

	readonly  // inherited from NSObjectProtocol

	constructor(o: { URLTemplate: string; });

	URLForTilePath(path: MKTileOverlayPath): NSURL;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithURLTemplate(URLTemplate: string): this;

	intersectsMapRect(mapRect: MKMapRect): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	loadTileAtPathResult(path: MKTileOverlayPath, result: (p1: NSData, p2: NSError) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

interface MKTileOverlayPath {
	x: number;
	y: number;
	z: number;
	contentScaleFactor: number;
}
declare var MKTileOverlayPath: interop.StructType<MKTileOverlayPath>;

/**
 * @since 7.0
 */
declare class MKTileOverlayRenderer extends MKOverlayRenderer {

	static alloc(): MKTileOverlayRenderer; // inherited from NSObject

	static new(): MKTileOverlayRenderer; // inherited from NSObject

	constructor(o: { tileOverlay: MKTileOverlay; });

	initWithTileOverlay(overlay: MKTileOverlay): this;

	reloadData(): void;
}

/**
 * @since 3.0
 */
declare class MKUserLocation extends NSObject implements MKAnnotation {

	static alloc(): MKUserLocation; // inherited from NSObject

	static new(): MKUserLocation; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	readonly heading: CLHeading;

	readonly location: CLLocation;

	subtitle: string;

	title: string;

	readonly updating: boolean;

	readonly coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 4.0
	 */
	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

/**
 * @since 14.0
 */
declare class MKUserLocationView extends MKAnnotationView {

	static alloc(): MKUserLocationView; // inherited from NSObject

	static appearance(): MKUserLocationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKUserLocationView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKUserLocationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserLocationView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKUserLocationView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserLocationView; // inherited from UIAppearance

	static new(): MKUserLocationView; // inherited from NSObject
}

/**
 * @since 5.0
 */
declare class MKUserTrackingBarButtonItem extends UIBarButtonItem {

	static alloc(): MKUserTrackingBarButtonItem; // inherited from NSObject

	static appearance(): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	/**
	 * @since 14.0
	 */
	static fixedSpaceItemOfWidth(width: number): MKUserTrackingBarButtonItem; // inherited from UIBarButtonItem

	/**
	 * @since 14.0
	 */
	static flexibleSpaceItem(): MKUserTrackingBarButtonItem; // inherited from UIBarButtonItem

	static new(): MKUserTrackingBarButtonItem; // inherited from NSObject

	mapView: MKMapView;

	constructor(o: { mapView: MKMapView; });

	initWithMapView(mapView: MKMapView): this;
}

/**
 * @since 11.0
 */
declare class MKUserTrackingButton extends UIView {

	static alloc(): MKUserTrackingButton; // inherited from NSObject

	static appearance(): MKUserTrackingButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MKUserTrackingButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKUserTrackingButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKUserTrackingButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingButton; // inherited from UIAppearance

	static new(): MKUserTrackingButton; // inherited from NSObject

	static userTrackingButtonWithMapView(mapView: MKMapView): MKUserTrackingButton;

	mapView: MKMapView;
}

/**
 * @since 5.0
 */
declare const enum MKUserTrackingMode {

	None = 0,

	Follow = 1,

	FollowWithHeading = 2
}
