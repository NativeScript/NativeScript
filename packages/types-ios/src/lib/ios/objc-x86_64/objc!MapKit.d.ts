
interface MKAnnotation extends NSObjectProtocol {

	coordinate: CLLocationCoordinate2D;

	subtitle?: string;

	title?: string;

	setCoordinate?(newCoordinate: CLLocationCoordinate2D): void;
}
declare var MKAnnotation: {

	prototype: MKAnnotation;
};

declare var MKAnnotationCalloutInfoDidChangeNotification: string;

declare class MKAnnotationView extends UIView {

	static alloc(): MKAnnotationView; // inherited from NSObject

	static appearance(): MKAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKAnnotationView; // inherited from UIAppearance

	static new(): MKAnnotationView; // inherited from NSObject

	annotation: MKAnnotation;

	calloutOffset: CGPoint;

	canShowCallout: boolean;

	centerOffset: CGPoint;

	readonly clusterAnnotationView: MKAnnotationView;

	clusteringIdentifier: string;

	collisionMode: MKAnnotationViewCollisionMode;

	detailCalloutAccessoryView: UIView;

	displayPriority: number;

	dragState: MKAnnotationViewDragState;

	draggable: boolean;

	enabled: boolean;

	highlighted: boolean;

	image: UIImage;

	leftCalloutAccessoryView: UIView;

	readonly reuseIdentifier: string;

	rightCalloutAccessoryView: UIView;

	selected: boolean;

	constructor(o: { annotation: MKAnnotation; reuseIdentifier: string; });

	initWithAnnotationReuseIdentifier(annotation: MKAnnotation, reuseIdentifier: string): this;

	prepareForDisplay(): void;

	prepareForReuse(): void;

	setDragStateAnimated(newDragState: MKAnnotationViewDragState, animated: boolean): void;

	setSelectedAnimated(selected: boolean, animated: boolean): void;
}

declare const enum MKAnnotationViewCollisionMode {

	Rectangle = 0,

	Circle = 1
}

declare const enum MKAnnotationViewDragState {

	None = 0,

	Starting = 1,

	Dragging = 2,

	Canceling = 3,

	Ending = 4
}

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

declare class MKCircleRenderer extends MKOverlayPathRenderer {

	static alloc(): MKCircleRenderer; // inherited from NSObject

	static new(): MKCircleRenderer; // inherited from NSObject

	readonly circle: MKCircle;

	constructor(o: { circle: MKCircle; });

	initWithCircle(circle: MKCircle): this;
}

declare class MKCircleView extends MKOverlayPathView {

	static alloc(): MKCircleView; // inherited from NSObject

	static appearance(): MKCircleView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKCircleView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKCircleView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCircleView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKCircleView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCircleView; // inherited from UIAppearance

	static new(): MKCircleView; // inherited from NSObject

	readonly circle: MKCircle;

	constructor(o: { circle: MKCircle; });

	initWithCircle(circle: MKCircle): this;
}

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

declare class MKCompassButton extends UIView {

	static alloc(): MKCompassButton; // inherited from NSObject

	static appearance(): MKCompassButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKCompassButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKCompassButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCompassButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKCompassButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKCompassButton; // inherited from UIAppearance

	static compassButtonWithMapView(mapView: MKMapView): MKCompassButton;

	static new(): MKCompassButton; // inherited from NSObject

	compassVisibility: MKFeatureVisibility;

	mapView: MKMapView;
}

declare function MKCoordinateForMapPoint(mapPoint: MKMapPoint): CLLocationCoordinate2D;

interface MKCoordinateRegion {
	center: CLLocationCoordinate2D;
	span: MKCoordinateSpan;
}
declare var MKCoordinateRegion: interop.StructType<MKCoordinateRegion>;

declare function MKCoordinateRegionForMapRect(rect: MKMapRect): MKCoordinateRegion;

declare function MKCoordinateRegionMakeWithDistance(centerCoordinate: CLLocationCoordinate2D, latitudinalMeters: number, longitudinalMeters: number): MKCoordinateRegion;

interface MKCoordinateSpan {
	latitudeDelta: number;
	longitudeDelta: number;
}
declare var MKCoordinateSpan: interop.StructType<MKCoordinateSpan>;

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

declare class MKDirectionsRequest extends NSObject {

	static alloc(): MKDirectionsRequest; // inherited from NSObject

	static isDirectionsRequestURL(url: NSURL): boolean;

	static new(): MKDirectionsRequest; // inherited from NSObject

	arrivalDate: Date;

	departureDate: Date;

	destination: MKMapItem;

	requestsAlternateRoutes: boolean;

	source: MKMapItem;

	transportType: MKDirectionsTransportType;

	constructor(o: { contentsOfURL: NSURL; });

	initWithContentsOfURL(url: NSURL): this;

	setDestination(destination: MKMapItem): void;

	setSource(source: MKMapItem): void;
}

declare class MKDirectionsResponse extends NSObject {

	static alloc(): MKDirectionsResponse; // inherited from NSObject

	static new(): MKDirectionsResponse; // inherited from NSObject

	readonly destination: MKMapItem;

	readonly routes: NSArray<MKRoute>;

	readonly source: MKMapItem;
}

declare const enum MKDirectionsTransportType {

	Automobile = 1,

	Walking = 2,

	Transit = 4,

	Any = 268435455
}

declare class MKDistanceFormatter extends NSFormatter {

	static alloc(): MKDistanceFormatter; // inherited from NSObject

	static new(): MKDistanceFormatter; // inherited from NSObject

	locale: NSLocale;

	unitStyle: MKDistanceFormatterUnitStyle;

	units: MKDistanceFormatterUnits;

	distanceFromString(distance: string): number;

	stringFromDistance(distance: number): string;
}

declare const enum MKDistanceFormatterUnitStyle {

	Default = 0,

	Abbreviated = 1,

	Full = 2
}

declare const enum MKDistanceFormatterUnits {

	Default = 0,

	Metric = 1,

	Imperial = 2,

	ImperialWithYards = 3
}

declare class MKETAResponse extends NSObject {

	static alloc(): MKETAResponse; // inherited from NSObject

	static new(): MKETAResponse; // inherited from NSObject

	readonly destination: MKMapItem;

	readonly distance: number;

	readonly expectedArrivalDate: Date;

	readonly expectedDepartureDate: Date;

	readonly expectedTravelTime: number;

	readonly source: MKMapItem;

	readonly transportType: MKDirectionsTransportType;
}

declare const enum MKErrorCode {

	Unknown = 1,

	ServerFailure = 2,

	LoadingThrottled = 3,

	PlacemarkNotFound = 4,

	DirectionsNotFound = 5,

	DecodingFailed = 6
}

declare var MKErrorDomain: string;

declare var MKFeatureDisplayPriorityDefaultHigh: number;

declare var MKFeatureDisplayPriorityDefaultLow: number;

declare var MKFeatureDisplayPriorityRequired: number;

declare const enum MKFeatureVisibility {

	Adaptive = 0,

	Hidden = 1,

	Visible = 2
}

declare class MKGeoJSONDecoder extends NSObject {

	static alloc(): MKGeoJSONDecoder; // inherited from NSObject

	static new(): MKGeoJSONDecoder; // inherited from NSObject

	geoJSONObjectsWithDataError(data: NSData): NSArray<MKGeoJSONObject>;
}

declare class MKGeoJSONFeature extends NSObject implements MKGeoJSONObject {

	static alloc(): MKGeoJSONFeature; // inherited from NSObject

	static new(): MKGeoJSONFeature; // inherited from NSObject

	readonly geometry: NSArray<MKShape>;

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

interface MKGeoJSONObject extends NSObjectProtocol {
}
declare var MKGeoJSONObject: {

	prototype: MKGeoJSONObject;
};

declare class MKGeodesicPolyline extends MKPolyline {

	static alloc(): MKGeodesicPolyline; // inherited from NSObject

	static new(): MKGeodesicPolyline; // inherited from NSObject

	static polylineWithCoordinatesCount(coords: interop.Pointer | interop.Reference<CLLocationCoordinate2D>, count: number): MKGeodesicPolyline; // inherited from MKPolyline

	static polylineWithPointsCount(points: interop.Pointer | interop.Reference<MKMapPoint>, count: number): MKGeodesicPolyline; // inherited from MKPolyline
}

declare var MKLaunchOptionsCameraKey: string;

declare var MKLaunchOptionsDirectionsModeDefault: string;

declare var MKLaunchOptionsDirectionsModeDriving: string;

declare var MKLaunchOptionsDirectionsModeKey: string;

declare var MKLaunchOptionsDirectionsModeTransit: string;

declare var MKLaunchOptionsDirectionsModeWalking: string;

declare var MKLaunchOptionsMapCenterKey: string;

declare var MKLaunchOptionsMapSpanKey: string;

declare var MKLaunchOptionsMapTypeKey: string;

declare var MKLaunchOptionsShowsTrafficKey: string;

declare class MKLocalSearch extends NSObject {

	static alloc(): MKLocalSearch; // inherited from NSObject

	static new(): MKLocalSearch; // inherited from NSObject

	readonly searching: boolean;

	constructor(o: { request: MKLocalSearchRequest; });

	cancel(): void;

	initWithRequest(request: MKLocalSearchRequest): this;

	startWithCompletionHandler(completionHandler: (p1: MKLocalSearchResponse, p2: NSError) => void): void;
}

declare class MKLocalSearchCompleter extends NSObject {

	static alloc(): MKLocalSearchCompleter; // inherited from NSObject

	static new(): MKLocalSearchCompleter; // inherited from NSObject

	delegate: MKLocalSearchCompleterDelegate;

	filterType: MKSearchCompletionFilterType;

	pointOfInterestFilter: MKPointOfInterestFilter;

	queryFragment: string;

	region: MKCoordinateRegion;

	resultTypes: MKLocalSearchCompleterResultType;

	readonly results: NSArray<MKLocalSearchCompletion>;

	readonly searching: boolean;

	cancel(): void;
}

interface MKLocalSearchCompleterDelegate extends NSObjectProtocol {

	completerDidFailWithError?(completer: MKLocalSearchCompleter, error: NSError): void;

	completerDidUpdateResults?(completer: MKLocalSearchCompleter): void;
}
declare var MKLocalSearchCompleterDelegate: {

	prototype: MKLocalSearchCompleterDelegate;
};

declare const enum MKLocalSearchCompleterResultType {

	Address = 1,

	PointOfInterest = 2,

	Query = 4
}

declare class MKLocalSearchCompletion extends NSObject {

	static alloc(): MKLocalSearchCompletion; // inherited from NSObject

	static new(): MKLocalSearchCompletion; // inherited from NSObject

	readonly subtitle: string;

	readonly subtitleHighlightRanges: NSArray<NSValue>;

	readonly title: string;

	readonly titleHighlightRanges: NSArray<NSValue>;
}

declare class MKLocalSearchRequest extends NSObject implements NSCopying {

	static alloc(): MKLocalSearchRequest; // inherited from NSObject

	static new(): MKLocalSearchRequest; // inherited from NSObject

	naturalLanguageQuery: string;

	pointOfInterestFilter: MKPointOfInterestFilter;

	region: MKCoordinateRegion;

	resultTypes: MKLocalSearchResultType;

	constructor(o: { completion: MKLocalSearchCompletion; });

	constructor(o: { naturalLanguageQuery: string; });

	constructor(o: { naturalLanguageQuery: string; region: MKCoordinateRegion; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCompletion(completion: MKLocalSearchCompletion): this;

	initWithNaturalLanguageQuery(naturalLanguageQuery: string): this;

	initWithNaturalLanguageQueryRegion(naturalLanguageQuery: string, region: MKCoordinateRegion): this;
}

declare class MKLocalSearchResponse extends NSObject {

	static alloc(): MKLocalSearchResponse; // inherited from NSObject

	static new(): MKLocalSearchResponse; // inherited from NSObject

	readonly boundingRegion: MKCoordinateRegion;

	readonly mapItems: NSArray<MKMapItem>;
}

declare const enum MKLocalSearchResultType {

	Address = 1,

	PointOfInterest = 2
}

declare class MKMapCamera extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKMapCamera; // inherited from NSObject

	static camera(): MKMapCamera;

	static cameraLookingAtCenterCoordinateFromDistancePitchHeading(centerCoordinate: CLLocationCoordinate2D, distance: number, pitch: number, heading: number): MKMapCamera;

	static cameraLookingAtCenterCoordinateFromEyeCoordinateEyeAltitude(centerCoordinate: CLLocationCoordinate2D, eyeCoordinate: CLLocationCoordinate2D, eyeAltitude: number): MKMapCamera;

	static new(): MKMapCamera; // inherited from NSObject

	altitude: number;

	centerCoordinate: CLLocationCoordinate2D;

	centerCoordinateDistance: number;

	heading: number;

	pitch: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

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

declare var MKMapCameraZoomDefault: number;

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

declare class MKMapItem extends NSObject implements NSItemProviderReading, NSItemProviderWriting, NSSecureCoding {

	static alloc(): MKMapItem; // inherited from NSObject

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static mapItemForCurrentLocation(): MKMapItem;

	static new(): MKMapItem; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): MKMapItem;

	static openMapsWithItemsLaunchOptions(mapItems: NSArray<MKMapItem> | MKMapItem[], launchOptions: NSDictionary<string, any>): boolean;

	static openMapsWithItemsLaunchOptionsFromSceneCompletionHandler(mapItems: NSArray<MKMapItem> | MKMapItem[], launchOptions: NSDictionary<string, any>, scene: UIScene, completion: (p1: boolean) => void): void;

	readonly isCurrentLocation: boolean;

	name: string;

	phoneNumber: string;

	readonly placemark: MKPlacemark;

	pointOfInterestCategory: string;

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

	openInMapsWithLaunchOptionsFromSceneCompletionHandler(launchOptions: NSDictionary<string, any>, scene: UIScene, completion: (p1: boolean) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare var MKMapItemTypeIdentifier: string;

interface MKMapPoint {
	x: number;
	y: number;
}
declare var MKMapPoint: interop.StructType<MKMapPoint>;

declare function MKMapPointForCoordinate(coordinate: CLLocationCoordinate2D): MKMapPoint;

declare function MKMapPointsPerMeterAtLatitude(latitude: number): number;

interface MKMapRect {
	origin: MKMapPoint;
	size: MKMapSize;
}
declare var MKMapRect: interop.StructType<MKMapRect>;

declare function MKMapRectContainsPoint(rect: MKMapRect, point: MKMapPoint): boolean;

declare function MKMapRectContainsRect(rect1: MKMapRect, rect2: MKMapRect): boolean;

declare function MKMapRectDivide(rect: MKMapRect, slice: interop.Pointer | interop.Reference<MKMapRect>, remainder: interop.Pointer | interop.Reference<MKMapRect>, amount: number, edge: CGRectEdge): void;

declare function MKMapRectInset(rect: MKMapRect, dx: number, dy: number): MKMapRect;

declare function MKMapRectIntersection(rect1: MKMapRect, rect2: MKMapRect): MKMapRect;

declare function MKMapRectIntersectsRect(rect1: MKMapRect, rect2: MKMapRect): boolean;

declare var MKMapRectNull: MKMapRect;

declare function MKMapRectOffset(rect: MKMapRect, dx: number, dy: number): MKMapRect;

declare function MKMapRectRemainder(rect: MKMapRect): MKMapRect;

declare function MKMapRectSpans180thMeridian(rect: MKMapRect): boolean;

declare function MKMapRectUnion(rect1: MKMapRect, rect2: MKMapRect): MKMapRect;

declare var MKMapRectWorld: MKMapRect;

interface MKMapSize {
	width: number;
	height: number;
}
declare var MKMapSize: interop.StructType<MKMapSize>;

declare var MKMapSizeWorld: MKMapSize;

declare class MKMapSnapshot extends NSObject {

	static alloc(): MKMapSnapshot; // inherited from NSObject

	static new(): MKMapSnapshot; // inherited from NSObject

	readonly image: UIImage;

	readonly traitCollection: UITraitCollection;

	pointForCoordinate(coordinate: CLLocationCoordinate2D): CGPoint;
}

declare class MKMapSnapshotOptions extends NSObject implements NSCopying {

	static alloc(): MKMapSnapshotOptions; // inherited from NSObject

	static new(): MKMapSnapshotOptions; // inherited from NSObject

	camera: MKMapCamera;

	mapRect: MKMapRect;

	mapType: MKMapType;

	pointOfInterestFilter: MKPointOfInterestFilter;

	region: MKCoordinateRegion;

	scale: number;

	showsBuildings: boolean;

	showsPointsOfInterest: boolean;

	size: CGSize;

	traitCollection: UITraitCollection;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class MKMapSnapshotter extends NSObject {

	static alloc(): MKMapSnapshotter; // inherited from NSObject

	static new(): MKMapSnapshotter; // inherited from NSObject

	readonly loading: boolean;

	constructor(o: { options: MKMapSnapshotOptions; });

	cancel(): void;

	initWithOptions(options: MKMapSnapshotOptions): this;

	startWithCompletionHandler(completionHandler: (p1: MKMapSnapshot, p2: NSError) => void): void;

	startWithQueueCompletionHandler(queue: NSObject, completionHandler: (p1: MKMapSnapshot, p2: NSError) => void): void;
}

declare const enum MKMapType {

	Standard = 0,

	Satellite = 1,

	Hybrid = 2,

	SatelliteFlyover = 3,

	HybridFlyover = 4,

	MutedStandard = 5
}

declare class MKMapView extends UIView implements NSCoding {

	static alloc(): MKMapView; // inherited from NSObject

	static appearance(): MKMapView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKMapView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKMapView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKMapView; // inherited from UIAppearance

	static new(): MKMapView; // inherited from NSObject

	readonly annotationVisibleRect: CGRect;

	readonly annotations: NSArray<MKAnnotation>;

	camera: MKMapCamera;

	cameraBoundary: MKMapCameraBoundary;

	cameraZoomRange: MKMapCameraZoomRange;

	centerCoordinate: CLLocationCoordinate2D;

	delegate: MKMapViewDelegate;

	mapType: MKMapType;

	readonly overlays: NSArray<MKOverlay>;

	pitchEnabled: boolean;

	pointOfInterestFilter: MKPointOfInterestFilter;

	region: MKCoordinateRegion;

	rotateEnabled: boolean;

	scrollEnabled: boolean;

	selectedAnnotations: NSArray<MKAnnotation>;

	showsBuildings: boolean;

	showsCompass: boolean;

	showsPointsOfInterest: boolean;

	showsScale: boolean;

	showsTraffic: boolean;

	showsUserLocation: boolean;

	readonly userLocation: MKUserLocation;

	readonly userLocationVisible: boolean;

	userTrackingMode: MKUserTrackingMode;

	visibleMapRect: MKMapRect;

	zoomEnabled: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAnnotation(annotation: MKAnnotation): void;

	addAnnotations(annotations: NSArray<MKAnnotation> | MKAnnotation[]): void;

	addOverlay(overlay: MKOverlay): void;

	addOverlayLevel(overlay: MKOverlay, level: MKOverlayLevel): void;

	addOverlays(overlays: NSArray<MKOverlay> | MKOverlay[]): void;

	addOverlaysLevel(overlays: NSArray<MKOverlay> | MKOverlay[], level: MKOverlayLevel): void;

	annotationsInMapRect(mapRect: MKMapRect): NSSet<MKAnnotation>;

	convertCoordinateToPointToView(coordinate: CLLocationCoordinate2D, view: UIView): CGPoint;

	convertPointToCoordinateFromView(point: CGPoint, view: UIView): CLLocationCoordinate2D;

	convertRectToRegionFromView(rect: CGRect, view: UIView): MKCoordinateRegion;

	convertRegionToRectToView(region: MKCoordinateRegion, view: UIView): CGRect;

	dequeueReusableAnnotationViewWithIdentifier(identifier: string): MKAnnotationView;

	dequeueReusableAnnotationViewWithIdentifierForAnnotation(identifier: string, annotation: MKAnnotation): MKAnnotationView;

	deselectAnnotationAnimated(annotation: MKAnnotation, animated: boolean): void;

	encodeWithCoder(coder: NSCoder): void;

	exchangeOverlayAtIndexWithOverlayAtIndex(index1: number, index2: number): void;

	exchangeOverlayWithOverlay(overlay1: MKOverlay, overlay2: MKOverlay): void;

	initWithCoder(coder: NSCoder): this;

	insertOverlayAboveOverlay(overlay: MKOverlay, sibling: MKOverlay): void;

	insertOverlayAtIndex(overlay: MKOverlay, index: number): void;

	insertOverlayAtIndexLevel(overlay: MKOverlay, index: number, level: MKOverlayLevel): void;

	insertOverlayBelowOverlay(overlay: MKOverlay, sibling: MKOverlay): void;

	mapRectThatFits(mapRect: MKMapRect): MKMapRect;

	mapRectThatFitsEdgePadding(mapRect: MKMapRect, insets: UIEdgeInsets): MKMapRect;

	overlaysInLevel(level: MKOverlayLevel): NSArray<MKOverlay>;

	regionThatFits(region: MKCoordinateRegion): MKCoordinateRegion;

	registerClassForAnnotationViewWithReuseIdentifier(viewClass: typeof NSObject, identifier: string): void;

	removeAnnotation(annotation: MKAnnotation): void;

	removeAnnotations(annotations: NSArray<MKAnnotation> | MKAnnotation[]): void;

	removeOverlay(overlay: MKOverlay): void;

	removeOverlays(overlays: NSArray<MKOverlay> | MKOverlay[]): void;

	rendererForOverlay(overlay: MKOverlay): MKOverlayRenderer;

	selectAnnotationAnimated(annotation: MKAnnotation, animated: boolean): void;

	setCameraAnimated(camera: MKMapCamera, animated: boolean): void;

	setCameraBoundaryAnimated(cameraBoundary: MKMapCameraBoundary, animated: boolean): void;

	setCameraZoomRangeAnimated(cameraZoomRange: MKMapCameraZoomRange, animated: boolean): void;

	setCenterCoordinateAnimated(coordinate: CLLocationCoordinate2D, animated: boolean): void;

	setRegionAnimated(region: MKCoordinateRegion, animated: boolean): void;

	setUserTrackingModeAnimated(mode: MKUserTrackingMode, animated: boolean): void;

	setVisibleMapRectAnimated(mapRect: MKMapRect, animate: boolean): void;

	setVisibleMapRectEdgePaddingAnimated(mapRect: MKMapRect, insets: UIEdgeInsets, animate: boolean): void;

	showAnnotationsAnimated(annotations: NSArray<MKAnnotation> | MKAnnotation[], animated: boolean): void;

	viewForAnnotation(annotation: MKAnnotation): MKAnnotationView;

	viewForOverlay(overlay: MKOverlay): MKOverlayView;
}

declare var MKMapViewDefaultAnnotationViewReuseIdentifier: string;

declare var MKMapViewDefaultClusterAnnotationViewReuseIdentifier: string;

interface MKMapViewDelegate extends NSObjectProtocol {

	mapViewAnnotationViewCalloutAccessoryControlTapped?(mapView: MKMapView, view: MKAnnotationView, control: UIControl): void;

	mapViewAnnotationViewDidChangeDragStateFromOldState?(mapView: MKMapView, view: MKAnnotationView, newState: MKAnnotationViewDragState, oldState: MKAnnotationViewDragState): void;

	mapViewClusterAnnotationForMemberAnnotations?(mapView: MKMapView, memberAnnotations: NSArray<MKAnnotation> | MKAnnotation[]): MKClusterAnnotation;

	mapViewDidAddAnnotationViews?(mapView: MKMapView, views: NSArray<MKAnnotationView> | MKAnnotationView[]): void;

	mapViewDidAddOverlayRenderers?(mapView: MKMapView, renderers: NSArray<MKOverlayRenderer> | MKOverlayRenderer[]): void;

	mapViewDidAddOverlayViews?(mapView: MKMapView, overlayViews: NSArray<any> | any[]): void;

	mapViewDidChangeUserTrackingModeAnimated?(mapView: MKMapView, mode: MKUserTrackingMode, animated: boolean): void;

	mapViewDidChangeVisibleRegion?(mapView: MKMapView): void;

	mapViewDidDeselectAnnotationView?(mapView: MKMapView, view: MKAnnotationView): void;

	mapViewDidFailLoadingMapWithError?(mapView: MKMapView, error: NSError): void;

	mapViewDidFailToLocateUserWithError?(mapView: MKMapView, error: NSError): void;

	mapViewDidFinishLoadingMap?(mapView: MKMapView): void;

	mapViewDidFinishRenderingMapFullyRendered?(mapView: MKMapView, fullyRendered: boolean): void;

	mapViewDidSelectAnnotationView?(mapView: MKMapView, view: MKAnnotationView): void;

	mapViewDidStopLocatingUser?(mapView: MKMapView): void;

	mapViewDidUpdateUserLocation?(mapView: MKMapView, userLocation: MKUserLocation): void;

	mapViewRegionDidChangeAnimated?(mapView: MKMapView, animated: boolean): void;

	mapViewRegionWillChangeAnimated?(mapView: MKMapView, animated: boolean): void;

	mapViewRendererForOverlay?(mapView: MKMapView, overlay: MKOverlay): MKOverlayRenderer;

	mapViewViewForAnnotation?(mapView: MKMapView, annotation: MKAnnotation): MKAnnotationView;

	mapViewViewForOverlay?(mapView: MKMapView, overlay: MKOverlay): MKOverlayView;

	mapViewWillStartLoadingMap?(mapView: MKMapView): void;

	mapViewWillStartLocatingUser?(mapView: MKMapView): void;

	mapViewWillStartRenderingMap?(mapView: MKMapView): void;
}
declare var MKMapViewDelegate: {

	prototype: MKMapViewDelegate;
};

declare class MKMarkerAnnotationView extends MKAnnotationView {

	static alloc(): MKMarkerAnnotationView; // inherited from NSObject

	static appearance(): MKMarkerAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKMarkerAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKMarkerAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKMarkerAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKMarkerAnnotationView; // inherited from UIAppearance

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

declare function MKMetersBetweenMapPoints(a: MKMapPoint, b: MKMapPoint): number;

declare function MKMetersPerMapPointAtLatitude(latitude: number): number;

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

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	points(): interop.Pointer | interop.Reference<MKMapPoint>;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

declare class MKMultiPolygonRenderer extends MKOverlayPathRenderer {

	static alloc(): MKMultiPolygonRenderer; // inherited from NSObject

	static new(): MKMultiPolygonRenderer; // inherited from NSObject

	readonly multiPolygon: MKMultiPolygon;

	constructor(o: { multiPolygon: MKMultiPolygon; });

	initWithMultiPolygon(multiPolygon: MKMultiPolygon): this;
}

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

declare class MKMultiPolylineRenderer extends MKOverlayPathRenderer {

	static alloc(): MKMultiPolylineRenderer; // inherited from NSObject

	static new(): MKMultiPolylineRenderer; // inherited from NSObject

	readonly multiPolyline: MKMultiPolyline;

	constructor(o: { multiPolyline: MKMultiPolyline; });

	initWithMultiPolyline(multiPolyline: MKMultiPolyline): this;
}

interface MKOverlay extends MKAnnotation {

	boundingMapRect: MKMapRect;

	canReplaceMapContent: boolean;

	intersectsMapRect?(mapRect: MKMapRect): boolean;
}
declare var MKOverlay: {

	prototype: MKOverlay;
};

declare const enum MKOverlayLevel {

	AboveRoads = 0,

	AboveLabels = 1
}

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

	shouldRasterize: boolean;

	strokeColor: UIColor;

	applyFillPropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	applyStrokePropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	createPath(): void;

	fillPathInContext(path: any, context: any): void;

	invalidatePath(): void;

	strokePathInContext(path: any, context: any): void;
}

declare class MKOverlayPathView extends MKOverlayView {

	static alloc(): MKOverlayPathView; // inherited from NSObject

	static appearance(): MKOverlayPathView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKOverlayPathView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKOverlayPathView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayPathView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKOverlayPathView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayPathView; // inherited from UIAppearance

	static new(): MKOverlayPathView; // inherited from NSObject

	fillColor: UIColor;

	lineCap: CGLineCap;

	lineDashPattern: NSArray<any>;

	lineDashPhase: number;

	lineJoin: CGLineJoin;

	lineWidth: number;

	miterLimit: number;

	path: any;

	strokeColor: UIColor;

	applyFillPropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	applyStrokePropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	createPath(): void;

	fillPathInContext(path: any, context: any): void;

	invalidatePath(): void;

	strokePathInContext(path: any, context: any): void;
}

declare class MKOverlayRenderer extends NSObject {

	static alloc(): MKOverlayRenderer; // inherited from NSObject

	static new(): MKOverlayRenderer; // inherited from NSObject

	alpha: number;

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

declare class MKOverlayView extends UIView {

	static alloc(): MKOverlayView; // inherited from NSObject

	static appearance(): MKOverlayView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKOverlayView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKOverlayView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKOverlayView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKOverlayView; // inherited from UIAppearance

	static new(): MKOverlayView; // inherited from NSObject

	readonly overlay: MKOverlay;

	constructor(o: { overlay: MKOverlay; });

	canDrawMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): boolean;

	drawMapRectZoomScaleInContext(mapRect: MKMapRect, zoomScale: number, context: any): void;

	initWithOverlay(overlay: MKOverlay): this;

	mapPointForPoint(point: CGPoint): MKMapPoint;

	mapRectForRect(rect: CGRect): MKMapRect;

	pointForMapPoint(mapPoint: MKMapPoint): CGPoint;

	rectForMapRect(mapRect: MKMapRect): CGRect;

	setNeedsDisplayInMapRect(mapRect: MKMapRect): void;

	setNeedsDisplayInMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): void;
}

declare const enum MKPinAnnotationColor {

	Red = 0,

	Green = 1,

	Purple = 2
}

declare class MKPinAnnotationView extends MKAnnotationView {

	static alloc(): MKPinAnnotationView; // inherited from NSObject

	static appearance(): MKPinAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKPinAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKPinAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPinAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKPinAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPinAnnotationView; // inherited from UIAppearance

	static greenPinColor(): UIColor;

	static new(): MKPinAnnotationView; // inherited from NSObject

	static purplePinColor(): UIColor;

	static redPinColor(): UIColor;

	animatesDrop: boolean;

	pinColor: MKPinAnnotationColor;

	pinTintColor: UIColor;
}

declare class MKPlacemark extends CLPlacemark implements MKAnnotation {

	static alloc(): MKPlacemark; // inherited from NSObject

	static new(): MKPlacemark; // inherited from NSObject

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

	constructor(o: { coordinate: CLLocationCoordinate2D; });

	constructor(o: { coordinate: CLLocationCoordinate2D; addressDictionary: NSDictionary<string, any>; });

	constructor(o: { coordinate: CLLocationCoordinate2D; postalAddress: CNPostalAddress; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

	initWithCoordinateAddressDictionary(coordinate: CLLocationCoordinate2D, addressDictionary: NSDictionary<string, any>): this;

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

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

	constructor(o: { coordinate: CLLocationCoordinate2D; });

	constructor(o: { coordinate: CLLocationCoordinate2D; title: string; subtitle: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

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

declare var MKPointOfInterestCategoryATM: string;

declare var MKPointOfInterestCategoryAirport: string;

declare var MKPointOfInterestCategoryAmusementPark: string;

declare var MKPointOfInterestCategoryAquarium: string;

declare var MKPointOfInterestCategoryBakery: string;

declare var MKPointOfInterestCategoryBank: string;

declare var MKPointOfInterestCategoryBeach: string;

declare var MKPointOfInterestCategoryBrewery: string;

declare var MKPointOfInterestCategoryCafe: string;

declare var MKPointOfInterestCategoryCampground: string;

declare var MKPointOfInterestCategoryCarRental: string;

declare var MKPointOfInterestCategoryEVCharger: string;

declare var MKPointOfInterestCategoryFireStation: string;

declare var MKPointOfInterestCategoryFitnessCenter: string;

declare var MKPointOfInterestCategoryFoodMarket: string;

declare var MKPointOfInterestCategoryGasStation: string;

declare var MKPointOfInterestCategoryHospital: string;

declare var MKPointOfInterestCategoryHotel: string;

declare var MKPointOfInterestCategoryLaundry: string;

declare var MKPointOfInterestCategoryLibrary: string;

declare var MKPointOfInterestCategoryMarina: string;

declare var MKPointOfInterestCategoryMovieTheater: string;

declare var MKPointOfInterestCategoryMuseum: string;

declare var MKPointOfInterestCategoryNationalPark: string;

declare var MKPointOfInterestCategoryNightlife: string;

declare var MKPointOfInterestCategoryPark: string;

declare var MKPointOfInterestCategoryParking: string;

declare var MKPointOfInterestCategoryPharmacy: string;

declare var MKPointOfInterestCategoryPolice: string;

declare var MKPointOfInterestCategoryPostOffice: string;

declare var MKPointOfInterestCategoryPublicTransport: string;

declare var MKPointOfInterestCategoryRestaurant: string;

declare var MKPointOfInterestCategoryRestroom: string;

declare var MKPointOfInterestCategorySchool: string;

declare var MKPointOfInterestCategoryStadium: string;

declare var MKPointOfInterestCategoryStore: string;

declare var MKPointOfInterestCategoryTheater: string;

declare var MKPointOfInterestCategoryUniversity: string;

declare var MKPointOfInterestCategoryWinery: string;

declare var MKPointOfInterestCategoryZoo: string;

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

declare class MKPolygonRenderer extends MKOverlayPathRenderer {

	static alloc(): MKPolygonRenderer; // inherited from NSObject

	static new(): MKPolygonRenderer; // inherited from NSObject

	readonly polygon: MKPolygon;

	constructor(o: { polygon: MKPolygon; });

	initWithPolygon(polygon: MKPolygon): this;
}

declare class MKPolygonView extends MKOverlayPathView {

	static alloc(): MKPolygonView; // inherited from NSObject

	static appearance(): MKPolygonView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKPolygonView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKPolygonView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolygonView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKPolygonView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolygonView; // inherited from UIAppearance

	static new(): MKPolygonView; // inherited from NSObject

	readonly polygon: MKPolygon;

	constructor(o: { polygon: MKPolygon; });

	initWithPolygon(polygon: MKPolygon): this;
}

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

declare class MKPolylineRenderer extends MKOverlayPathRenderer {

	static alloc(): MKPolylineRenderer; // inherited from NSObject

	static new(): MKPolylineRenderer; // inherited from NSObject

	readonly polyline: MKPolyline;

	constructor(o: { polyline: MKPolyline; });

	initWithPolyline(polyline: MKPolyline): this;
}

declare class MKPolylineView extends MKOverlayPathView {

	static alloc(): MKPolylineView; // inherited from NSObject

	static appearance(): MKPolylineView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKPolylineView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKPolylineView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolylineView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKPolylineView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKPolylineView; // inherited from UIAppearance

	static new(): MKPolylineView; // inherited from NSObject

	readonly polyline: MKPolyline;

	constructor(o: { polyline: MKPolyline; });

	initWithPolyline(polyline: MKPolyline): this;
}

declare class MKReverseGeocoder extends NSObject {

	static alloc(): MKReverseGeocoder; // inherited from NSObject

	static new(): MKReverseGeocoder; // inherited from NSObject

	readonly coordinate: CLLocationCoordinate2D;

	delegate: MKReverseGeocoderDelegate;

	readonly placemark: MKPlacemark;

	readonly querying: boolean;

	constructor(o: { coordinate: CLLocationCoordinate2D; });

	cancel(): void;

	initWithCoordinate(coordinate: CLLocationCoordinate2D): this;

	start(): void;
}

interface MKReverseGeocoderDelegate extends NSObjectProtocol {

	reverseGeocoderDidFailWithError(geocoder: MKReverseGeocoder, error: NSError): void;

	reverseGeocoderDidFindPlacemark(geocoder: MKReverseGeocoder, placemark: MKPlacemark): void;
}
declare var MKReverseGeocoderDelegate: {

	prototype: MKReverseGeocoderDelegate;
};

declare function MKRoadWidthAtZoomScale(zoomScale: number): number;

declare function MKRoadWidthAtZoomScaleFunction(zoomScale: number): number;

declare class MKRoute extends NSObject {

	static alloc(): MKRoute; // inherited from NSObject

	static new(): MKRoute; // inherited from NSObject

	readonly advisoryNotices: NSArray<string>;

	readonly distance: number;

	readonly expectedTravelTime: number;

	readonly name: string;

	readonly polyline: MKPolyline;

	readonly steps: NSArray<MKRouteStep>;

	readonly transportType: MKDirectionsTransportType;
}

declare class MKRouteStep extends NSObject {

	static alloc(): MKRouteStep; // inherited from NSObject

	static new(): MKRouteStep; // inherited from NSObject

	readonly distance: number;

	readonly instructions: string;

	readonly notice: string;

	readonly polyline: MKPolyline;

	readonly transportType: MKDirectionsTransportType;
}

declare class MKScaleView extends UIView {

	static alloc(): MKScaleView; // inherited from NSObject

	static appearance(): MKScaleView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKScaleView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKScaleView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKScaleView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKScaleView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKScaleView; // inherited from UIAppearance

	static new(): MKScaleView; // inherited from NSObject

	static scaleViewWithMapView(mapView: MKMapView): MKScaleView;

	legendAlignment: MKScaleViewAlignment;

	mapView: MKMapView;

	scaleVisibility: MKFeatureVisibility;
}

declare const enum MKScaleViewAlignment {

	Leading = 0,

	Trailing = 1
}

declare const enum MKSearchCompletionFilterType {

	LocationsAndQueries = 0,

	LocationsOnly = 1
}

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

interface MKTileOverlayPath {
	x: number;
	y: number;
	z: number;
	contentScaleFactor: number;
}
declare var MKTileOverlayPath: interop.StructType<MKTileOverlayPath>;

declare class MKTileOverlayRenderer extends MKOverlayRenderer {

	static alloc(): MKTileOverlayRenderer; // inherited from NSObject

	static new(): MKTileOverlayRenderer; // inherited from NSObject

	constructor(o: { tileOverlay: MKTileOverlay; });

	initWithTileOverlay(overlay: MKTileOverlay): this;

	reloadData(): void;
}

declare class MKUserLocation extends NSObject implements MKAnnotation {

	static alloc(): MKUserLocation; // inherited from NSObject

	static new(): MKUserLocation; // inherited from NSObject

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

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void;
}

declare class MKUserTrackingBarButtonItem extends UIBarButtonItem {

	static alloc(): MKUserTrackingBarButtonItem; // inherited from NSObject

	static appearance(): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingBarButtonItem; // inherited from UIAppearance

	static new(): MKUserTrackingBarButtonItem; // inherited from NSObject

	mapView: MKMapView;

	constructor(o: { mapView: MKMapView; });

	initWithMapView(mapView: MKMapView): this;
}

declare class MKUserTrackingButton extends UIView {

	static alloc(): MKUserTrackingButton; // inherited from NSObject

	static appearance(): MKUserTrackingButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKUserTrackingButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKUserTrackingButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKUserTrackingButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MKUserTrackingButton; // inherited from UIAppearance

	static new(): MKUserTrackingButton; // inherited from NSObject

	static userTrackingButtonWithMapView(mapView: MKMapView): MKUserTrackingButton;

	mapView: MKMapView;
}

declare const enum MKUserTrackingMode {

	None = 0,

	Follow = 1,

	FollowWithHeading = 2
}
