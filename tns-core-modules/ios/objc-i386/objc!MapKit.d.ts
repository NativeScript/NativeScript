
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

	static appearance(): MKAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKAnnotationView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): MKAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKAnnotationView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): MKAnnotationView; // inherited from UIAppearance

	annotation: MKAnnotation;

	calloutOffset: CGPoint;

	canShowCallout: boolean;

	centerOffset: CGPoint;

	detailCalloutAccessoryView: UIView;

	dragState: MKAnnotationViewDragState;

	draggable: boolean;

	enabled: boolean;

	highlighted: boolean;

	image: UIImage;

	leftCalloutAccessoryView: UIView;

	/* readonly */ reuseIdentifier: string;

	rightCalloutAccessoryView: UIView;

	selected: boolean;

	constructor(o: { annotation: MKAnnotation; reuseIdentifier: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	prepareForReuse(): void;

	self(): MKAnnotationView; // inherited from NSObjectProtocol

	setDragStateAnimated(newDragState: MKAnnotationViewDragState, animated: boolean): void;

	setSelectedAnimated(selected: boolean, animated: boolean): void;
}

declare const enum MKAnnotationViewDragState {

	None = 0,

	Starting = 1,

	Dragging = 2,

	Canceling = 3,

	Ending = 4
}

declare class MKCircle extends MKShape implements MKOverlay {

	static circleWithCenterCoordinateRadius(coord: CLLocationCoordinate2D, radius: number): MKCircle;

	static circleWithMapRect(mapRect: MKMapRect): MKCircle;

	/* readonly */ radius: number;

	/* readonly */ boundingMapRect: MKMapRect; // inherited from MKOverlay

	/* readonly */ canReplaceMapContent: boolean; // inherited from MKOverlay

	intersectsMapRect(mapRect: MKMapRect): boolean; // inherited from MKOverlay

	self(): MKCircle; // inherited from NSObjectProtocol
}

declare class MKCircleRenderer extends MKOverlayPathRenderer {

	/* readonly */ circle: MKCircle;

	constructor(o: { circle: MKCircle; });
}

declare class MKCircleView extends MKOverlayPathView {

	/* readonly */ circle: MKCircle;

	constructor(o: { circle: MKCircle; });
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

	/* readonly */ calculating: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { request: MKDirectionsRequest; });

	calculateDirectionsWithCompletionHandler(completionHandler: (p1: MKDirectionsResponse, p2: NSError) => void): void;

	calculateETAWithCompletionHandler(completionHandler: (p1: MKETAResponse, p2: NSError) => void): void;

	cancel(): void;

	self(): MKDirections; // inherited from NSObjectProtocol
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

	constructor(); // inherited from NSObject

	constructor(o: { contentsOfURL: NSURL; });

	self(): MKDirectionsRequest; // inherited from NSObjectProtocol

	setDestination(destination: MKMapItem): void;

	setSource(source: MKMapItem): void;
}

declare class MKDirectionsResponse extends NSObject {

	static alloc(): MKDirectionsResponse; // inherited from NSObject

	static new(): MKDirectionsResponse; // inherited from NSObject

	/* readonly */ destination: MKMapItem;

	/* readonly */ routes: NSArray<MKRoute>;

	/* readonly */ source: MKMapItem;

	constructor(); // inherited from NSObject

	self(): MKDirectionsResponse; // inherited from NSObjectProtocol
}

declare const enum MKDirectionsTransportType {

	Automobile = 1,

	Walking = 2,

	Transit = 4,

	Any = 268435455
}

declare class MKDistanceFormatter extends NSFormatter {

	locale: NSLocale;

	unitStyle: MKDistanceFormatterUnitStyle;

	units: MKDistanceFormatterUnits;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

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

	/* readonly */ destination: MKMapItem;

	/* readonly */ distance: number;

	/* readonly */ expectedArrivalDate: Date;

	/* readonly */ expectedDepartureDate: Date;

	/* readonly */ expectedTravelTime: number;

	/* readonly */ source: MKMapItem;

	/* readonly */ transportType: MKDirectionsTransportType;

	constructor(); // inherited from NSObject

	self(): MKETAResponse; // inherited from NSObjectProtocol
}

declare const enum MKErrorCode {

	Unknown = 1,

	ServerFailure = 2,

	LoadingThrottled = 3,

	PlacemarkNotFound = 4,

	DirectionsNotFound = 5
}

declare var MKErrorDomain: string;

declare class MKGeodesicPolyline extends MKPolyline {

	static polylineWithCoordinatesCount(coords: interop.Reference<CLLocationCoordinate2D>, count: number): MKGeodesicPolyline; // inherited from MKPolyline

	static polylineWithPointsCount(points: interop.Reference<MKMapPoint>, count: number): MKGeodesicPolyline; // inherited from MKPolyline

	self(): MKGeodesicPolyline; // inherited from NSObjectProtocol
}

declare var MKLaunchOptionsCameraKey: string;

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

	/* readonly */ searching: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { request: MKLocalSearchRequest; });

	cancel(): void;

	self(): MKLocalSearch; // inherited from NSObjectProtocol

	startWithCompletionHandler(completionHandler: (p1: MKLocalSearchResponse, p2: NSError) => void): void;
}

declare class MKLocalSearchCompleter extends NSObject {

	static alloc(): MKLocalSearchCompleter; // inherited from NSObject

	static new(): MKLocalSearchCompleter; // inherited from NSObject

	delegate: MKLocalSearchCompleterDelegate;

	filterType: MKSearchCompletionFilterType;

	queryFragment: string;

	region: MKCoordinateRegion;

	/* readonly */ results: NSArray<MKLocalSearchCompletion>;

	/* readonly */ searching: boolean;

	constructor(); // inherited from NSObject

	cancel(): void;

	self(): MKLocalSearchCompleter; // inherited from NSObjectProtocol
}

interface MKLocalSearchCompleterDelegate extends NSObjectProtocol {

	completerDidFailWithError?(completer: MKLocalSearchCompleter, error: NSError): void;

	completerDidUpdateResults?(completer: MKLocalSearchCompleter): void;
}
declare var MKLocalSearchCompleterDelegate: {

	prototype: MKLocalSearchCompleterDelegate;
};

declare class MKLocalSearchCompletion extends NSObject {

	static alloc(): MKLocalSearchCompletion; // inherited from NSObject

	static new(): MKLocalSearchCompletion; // inherited from NSObject

	/* readonly */ subtitle: string;

	/* readonly */ subtitleHighlightRanges: NSArray<NSValue>;

	/* readonly */ title: string;

	/* readonly */ titleHighlightRanges: NSArray<NSValue>;

	constructor(); // inherited from NSObject

	self(): MKLocalSearchCompletion; // inherited from NSObjectProtocol
}

declare class MKLocalSearchRequest extends NSObject implements NSCopying {

	static alloc(): MKLocalSearchRequest; // inherited from NSObject

	static new(): MKLocalSearchRequest; // inherited from NSObject

	naturalLanguageQuery: string;

	region: MKCoordinateRegion;

	constructor(); // inherited from NSObject

	constructor(o: { completion: MKLocalSearchCompletion; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): MKLocalSearchRequest; // inherited from NSObjectProtocol
}

declare class MKLocalSearchResponse extends NSObject {

	static alloc(): MKLocalSearchResponse; // inherited from NSObject

	static new(): MKLocalSearchResponse; // inherited from NSObject

	/* readonly */ boundingRegion: MKCoordinateRegion;

	/* readonly */ mapItems: NSArray<MKMapItem>;

	constructor(); // inherited from NSObject

	self(): MKLocalSearchResponse; // inherited from NSObjectProtocol
}

declare class MKMapCamera extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MKMapCamera; // inherited from NSObject

	static camera(): MKMapCamera;

	static cameraLookingAtCenterCoordinateFromDistancePitchHeading(centerCoordinate: CLLocationCoordinate2D, distance: number, pitch: number, heading: number): MKMapCamera;

	static cameraLookingAtCenterCoordinateFromEyeCoordinateEyeAltitude(centerCoordinate: CLLocationCoordinate2D, eyeCoordinate: CLLocationCoordinate2D, eyeAltitude: number): MKMapCamera;

	static new(): MKMapCamera; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	altitude: number;

	centerCoordinate: CLLocationCoordinate2D;

	heading: number;

	pitch: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): MKMapCamera; // inherited from NSObjectProtocol
}

declare class MKMapItem extends NSObject {

	static alloc(): MKMapItem; // inherited from NSObject

	static mapItemForCurrentLocation(): MKMapItem;

	static new(): MKMapItem; // inherited from NSObject

	static openMapsWithItemsLaunchOptions(mapItems: NSArray<MKMapItem>, launchOptions: NSDictionary<string, any>): boolean;

	/* readonly */ isCurrentLocation: boolean;

	name: string;

	phoneNumber: string;

	/* readonly */ placemark: MKPlacemark;

	timeZone: NSTimeZone;

	url: NSURL;

	constructor(); // inherited from NSObject

	constructor(o: { placemark: MKPlacemark; });

	openInMapsWithLaunchOptions(launchOptions: NSDictionary<string, any>): boolean;

	self(): MKMapItem; // inherited from NSObjectProtocol
}

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

declare function MKMapRectDivide(rect: MKMapRect, slice: interop.Reference<MKMapRect>, remainder: interop.Reference<MKMapRect>, amount: number, edge: CGRectEdge): void;

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

	/* readonly */ image: UIImage;

	constructor(); // inherited from NSObject

	pointForCoordinate(coordinate: CLLocationCoordinate2D): CGPoint;

	self(): MKMapSnapshot; // inherited from NSObjectProtocol
}

declare class MKMapSnapshotOptions extends NSObject implements NSCopying {

	static alloc(): MKMapSnapshotOptions; // inherited from NSObject

	static new(): MKMapSnapshotOptions; // inherited from NSObject

	camera: MKMapCamera;

	mapRect: MKMapRect;

	mapType: MKMapType;

	region: MKCoordinateRegion;

	scale: number;

	showsBuildings: boolean;

	showsPointsOfInterest: boolean;

	size: CGSize;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): MKMapSnapshotOptions; // inherited from NSObjectProtocol
}

declare class MKMapSnapshotter extends NSObject {

	static alloc(): MKMapSnapshotter; // inherited from NSObject

	static new(): MKMapSnapshotter; // inherited from NSObject

	/* readonly */ loading: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { options: MKMapSnapshotOptions; });

	cancel(): void;

	self(): MKMapSnapshotter; // inherited from NSObjectProtocol

	startWithCompletionHandler(completionHandler: (p1: MKMapSnapshot, p2: NSError) => void): void;

	startWithQueueCompletionHandler(queue: NSObject, completionHandler: (p1: MKMapSnapshot, p2: NSError) => void): void;
}

declare const enum MKMapType {

	Standard = 0,

	Satellite = 1,

	Hybrid = 2,

	SatelliteFlyover = 3,

	HybridFlyover = 4
}

declare class MKMapView extends UIView implements NSCoding {

	static appearance(): MKMapView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKMapView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): MKMapView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKMapView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): MKMapView; // inherited from UIAppearance

	/* readonly */ annotationVisibleRect: CGRect;

	/* readonly */ annotations: NSArray<MKAnnotation>;

	camera: MKMapCamera;

	centerCoordinate: CLLocationCoordinate2D;

	delegate: MKMapViewDelegate;

	mapType: MKMapType;

	/* readonly */ overlays: NSArray<MKOverlay>;

	pitchEnabled: boolean;

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

	/* readonly */ userLocation: MKUserLocation;

	/* readonly */ userLocationVisible: boolean;

	userTrackingMode: MKUserTrackingMode;

	visibleMapRect: MKMapRect;

	zoomEnabled: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	addAnnotation(annotation: MKAnnotation): void;

	addAnnotations(annotations: NSArray<MKAnnotation>): void;

	addOverlay(overlay: MKOverlay): void;

	addOverlayLevel(overlay: MKOverlay, level: MKOverlayLevel): void;

	addOverlays(overlays: NSArray<MKOverlay>): void;

	addOverlaysLevel(overlays: NSArray<MKOverlay>, level: MKOverlayLevel): void;

	annotationsInMapRect(mapRect: MKMapRect): NSSet<MKAnnotation>;

	convertCoordinateToPointToView(coordinate: CLLocationCoordinate2D, view: UIView): CGPoint;

	convertPointToCoordinateFromView(point: CGPoint, view: UIView): CLLocationCoordinate2D;

	convertRectToRegionFromView(rect: CGRect, view: UIView): MKCoordinateRegion;

	convertRegionToRectToView(region: MKCoordinateRegion, view: UIView): CGRect;

	dequeueReusableAnnotationViewWithIdentifier(identifier: string): MKAnnotationView;

	deselectAnnotationAnimated(annotation: MKAnnotation, animated: boolean): void;

	exchangeOverlayAtIndexWithOverlayAtIndex(index1: number, index2: number): void;

	exchangeOverlayWithOverlay(overlay1: MKOverlay, overlay2: MKOverlay): void;

	insertOverlayAboveOverlay(overlay: MKOverlay, sibling: MKOverlay): void;

	insertOverlayAtIndex(overlay: MKOverlay, index: number): void;

	insertOverlayAtIndexLevel(overlay: MKOverlay, index: number, level: MKOverlayLevel): void;

	insertOverlayBelowOverlay(overlay: MKOverlay, sibling: MKOverlay): void;

	mapRectThatFits(mapRect: MKMapRect): MKMapRect;

	mapRectThatFitsEdgePadding(mapRect: MKMapRect, insets: UIEdgeInsets): MKMapRect;

	overlaysInLevel(level: MKOverlayLevel): NSArray<MKOverlay>;

	regionThatFits(region: MKCoordinateRegion): MKCoordinateRegion;

	removeAnnotation(annotation: MKAnnotation): void;

	removeAnnotations(annotations: NSArray<MKAnnotation>): void;

	removeOverlay(overlay: MKOverlay): void;

	removeOverlays(overlays: NSArray<MKOverlay>): void;

	rendererForOverlay(overlay: MKOverlay): MKOverlayRenderer;

	selectAnnotationAnimated(annotation: MKAnnotation, animated: boolean): void;

	self(): MKMapView; // inherited from NSObjectProtocol

	setCameraAnimated(camera: MKMapCamera, animated: boolean): void;

	setCenterCoordinateAnimated(coordinate: CLLocationCoordinate2D, animated: boolean): void;

	setRegionAnimated(region: MKCoordinateRegion, animated: boolean): void;

	setUserTrackingModeAnimated(mode: MKUserTrackingMode, animated: boolean): void;

	setVisibleMapRectAnimated(mapRect: MKMapRect, animate: boolean): void;

	setVisibleMapRectEdgePaddingAnimated(mapRect: MKMapRect, insets: UIEdgeInsets, animate: boolean): void;

	showAnnotationsAnimated(annotations: NSArray<MKAnnotation>, animated: boolean): void;

	viewForAnnotation(annotation: MKAnnotation): MKAnnotationView;

	viewForOverlay(overlay: MKOverlay): MKOverlayView;
}

interface MKMapViewDelegate extends NSObjectProtocol {

	mapViewAnnotationViewCalloutAccessoryControlTapped?(mapView: MKMapView, view: MKAnnotationView, control: UIControl): void;

	mapViewAnnotationViewDidChangeDragStateFromOldState?(mapView: MKMapView, view: MKAnnotationView, newState: MKAnnotationViewDragState, oldState: MKAnnotationViewDragState): void;

	mapViewDidAddAnnotationViews?(mapView: MKMapView, views: NSArray<MKAnnotationView>): void;

	mapViewDidAddOverlayRenderers?(mapView: MKMapView, renderers: NSArray<MKOverlayRenderer>): void;

	mapViewDidAddOverlayViews?(mapView: MKMapView, overlayViews: NSArray<any>): void;

	mapViewDidChangeUserTrackingModeAnimated?(mapView: MKMapView, mode: MKUserTrackingMode, animated: boolean): void;

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

declare function MKMetersBetweenMapPoints(a: MKMapPoint, b: MKMapPoint): number;

declare function MKMetersPerMapPointAtLatitude(latitude: number): number;

declare class MKMultiPoint extends MKShape {

	/* readonly */ pointCount: number;

	getCoordinatesRange(coords: interop.Reference<CLLocationCoordinate2D>, range: NSRange): void;

	points(): interop.Reference<MKMapPoint>;

	self(): MKMultiPoint; // inherited from NSObjectProtocol
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

	fillColor: UIColor;

	lineCap: CGLineCap;

	lineDashPattern: NSArray<number>;

	lineDashPhase: number;

	lineJoin: CGLineJoin;

	lineWidth: number;

	miterLimit: number;

	path: any;

	strokeColor: UIColor;

	constructor(o: { overlay: MKOverlay; }); // inherited from MKOverlayRenderer

	applyFillPropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	applyStrokePropertiesToContextAtZoomScale(context: any, zoomScale: number): void;

	createPath(): void;

	fillPathInContext(path: any, context: any): void;

	invalidatePath(): void;

	strokePathInContext(path: any, context: any): void;
}

declare class MKOverlayPathView extends MKOverlayView {

	fillColor: UIColor;

	lineCap: CGLineCap;

	lineDashPattern: NSArray<any>;

	lineDashPhase: number;

	lineJoin: CGLineJoin;

	lineWidth: number;

	miterLimit: number;

	path: any;

	strokeColor: UIColor;

	constructor(o: { overlay: MKOverlay; }); // inherited from MKOverlayView

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

	/* readonly */ contentScaleFactor: number;

	/* readonly */ overlay: MKOverlay;

	constructor(); // inherited from NSObject

	constructor(o: { overlay: MKOverlay; });

	canDrawMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): boolean;

	drawMapRectZoomScaleInContext(mapRect: MKMapRect, zoomScale: number, context: any): void;

	mapPointForPoint(point: CGPoint): MKMapPoint;

	mapRectForRect(rect: CGRect): MKMapRect;

	pointForMapPoint(mapPoint: MKMapPoint): CGPoint;

	rectForMapRect(mapRect: MKMapRect): CGRect;

	self(): MKOverlayRenderer; // inherited from NSObjectProtocol

	setNeedsDisplay(): void;

	setNeedsDisplayInMapRect(mapRect: MKMapRect): void;

	setNeedsDisplayInMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): void;
}

declare class MKOverlayView extends UIView {

	static appearance(): MKOverlayView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MKOverlayView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MKOverlayView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): MKOverlayView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MKOverlayView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): MKOverlayView; // inherited from UIAppearance

	/* readonly */ overlay: MKOverlay;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	constructor(o: { overlay: MKOverlay; });

	canDrawMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): boolean;

	drawMapRectZoomScaleInContext(mapRect: MKMapRect, zoomScale: number, context: any): void;

	mapPointForPoint(point: CGPoint): MKMapPoint;

	mapRectForRect(rect: CGRect): MKMapRect;

	pointForMapPoint(mapPoint: MKMapPoint): CGPoint;

	rectForMapRect(mapRect: MKMapRect): CGRect;

	self(): MKOverlayView; // inherited from NSObjectProtocol

	setNeedsDisplayInMapRect(mapRect: MKMapRect): void;

	setNeedsDisplayInMapRectZoomScale(mapRect: MKMapRect, zoomScale: number): void;
}

declare const enum MKPinAnnotationColor {

	Red = 0,

	Green = 1,

	Purple = 2
}

declare class MKPinAnnotationView extends MKAnnotationView {

	static greenPinColor(): UIColor;

	static purplePinColor(): UIColor;

	static redPinColor(): UIColor;

	animatesDrop: boolean;

	pinColor: MKPinAnnotationColor;

	pinTintColor: UIColor;

	constructor(o: { annotation: MKAnnotation; reuseIdentifier: string; }); // inherited from MKAnnotationView
}

declare class MKPlacemark extends CLPlacemark implements MKAnnotation {

	/* readonly */ countryCode: string;

	/* readonly */ coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ subtitle: string; // inherited from MKAnnotation

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */ title: string; // inherited from MKAnnotation

	/* readonly */ zone: interop.Pointer; // inherited from NSObjectProtocol

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { coordinate: CLLocationCoordinate2D; addressDictionary: NSDictionary<string, any>; });

	constructor(o: { placemark: CLPlacemark; }); // inherited from CLPlacemark

	class(): typeof NSObject; // inherited from NSObjectProtocol

	conformsToProtocol(aProtocol: any /* Protocol */): boolean; // inherited from NSObjectProtocol

	isEqual(object: any): boolean; // inherited from NSObjectProtocol

	isKindOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	isMemberOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	performSelector(aSelector: string): any; // inherited from NSObjectProtocol

	performSelectorWithObject(aSelector: string, object: any): any; // inherited from NSObjectProtocol

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any; // inherited from NSObjectProtocol

	respondsToSelector(aSelector: string): boolean; // inherited from NSObjectProtocol

	retainCount(): number; // inherited from NSObjectProtocol

	self(): MKPlacemark; // inherited from NSObjectProtocol

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void; // inherited from MKAnnotation
}

declare class MKPointAnnotation extends MKShape {

	coordinate: CLLocationCoordinate2D;

	self(): MKPointAnnotation; // inherited from NSObjectProtocol
}

declare class MKPolygon extends MKMultiPoint implements MKOverlay {

	static polygonWithCoordinatesCount(coords: interop.Reference<CLLocationCoordinate2D>, count: number): MKPolygon;

	static polygonWithCoordinatesCountInteriorPolygons(coords: interop.Reference<CLLocationCoordinate2D>, count: number, interiorPolygons: NSArray<MKPolygon>): MKPolygon;

	static polygonWithPointsCount(points: interop.Reference<MKMapPoint>, count: number): MKPolygon;

	static polygonWithPointsCountInteriorPolygons(points: interop.Reference<MKMapPoint>, count: number, interiorPolygons: NSArray<MKPolygon>): MKPolygon;

	/* readonly */ interiorPolygons: NSArray<MKPolygon>;

	/* readonly */ boundingMapRect: MKMapRect; // inherited from MKOverlay

	/* readonly */ canReplaceMapContent: boolean; // inherited from MKOverlay

	/* readonly */ coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ subtitle: string; // inherited from MKAnnotation

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */ title: string; // inherited from MKAnnotation

	/* readonly */ zone: interop.Pointer; // inherited from NSObjectProtocol

	class(): typeof NSObject; // inherited from NSObjectProtocol

	conformsToProtocol(aProtocol: any /* Protocol */): boolean; // inherited from NSObjectProtocol

	intersectsMapRect(mapRect: MKMapRect): boolean; // inherited from MKOverlay

	isEqual(object: any): boolean; // inherited from NSObjectProtocol

	isKindOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	isMemberOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	performSelector(aSelector: string): any; // inherited from NSObjectProtocol

	performSelectorWithObject(aSelector: string, object: any): any; // inherited from NSObjectProtocol

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any; // inherited from NSObjectProtocol

	respondsToSelector(aSelector: string): boolean; // inherited from NSObjectProtocol

	retainCount(): number; // inherited from NSObjectProtocol

	self(): MKPolygon; // inherited from NSObjectProtocol

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void; // inherited from MKAnnotation
}

declare class MKPolygonRenderer extends MKOverlayPathRenderer {

	/* readonly */ polygon: MKPolygon;

	constructor(o: { polygon: MKPolygon; });
}

declare class MKPolygonView extends MKOverlayPathView {

	/* readonly */ polygon: MKPolygon;

	constructor(o: { polygon: MKPolygon; });
}

declare class MKPolyline extends MKMultiPoint implements MKOverlay {

	static polylineWithCoordinatesCount(coords: interop.Reference<CLLocationCoordinate2D>, count: number): MKPolyline;

	static polylineWithPointsCount(points: interop.Reference<MKMapPoint>, count: number): MKPolyline;

	/* readonly */ boundingMapRect: MKMapRect; // inherited from MKOverlay

	/* readonly */ canReplaceMapContent: boolean; // inherited from MKOverlay

	/* readonly */ coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ subtitle: string; // inherited from MKAnnotation

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */ title: string; // inherited from MKAnnotation

	/* readonly */ zone: interop.Pointer; // inherited from NSObjectProtocol

	class(): typeof NSObject; // inherited from NSObjectProtocol

	conformsToProtocol(aProtocol: any /* Protocol */): boolean; // inherited from NSObjectProtocol

	intersectsMapRect(mapRect: MKMapRect): boolean; // inherited from MKOverlay

	isEqual(object: any): boolean; // inherited from NSObjectProtocol

	isKindOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	isMemberOfClass(aClass: typeof NSObject): boolean; // inherited from NSObjectProtocol

	performSelector(aSelector: string): any; // inherited from NSObjectProtocol

	performSelectorWithObject(aSelector: string, object: any): any; // inherited from NSObjectProtocol

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any; // inherited from NSObjectProtocol

	respondsToSelector(aSelector: string): boolean; // inherited from NSObjectProtocol

	retainCount(): number; // inherited from NSObjectProtocol

	self(): MKPolyline; // inherited from NSObjectProtocol

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void; // inherited from MKAnnotation
}

declare class MKPolylineRenderer extends MKOverlayPathRenderer {

	/* readonly */ polyline: MKPolyline;

	constructor(o: { polyline: MKPolyline; });
}

declare class MKPolylineView extends MKOverlayPathView {

	/* readonly */ polyline: MKPolyline;

	constructor(o: { polyline: MKPolyline; });
}

declare class MKReverseGeocoder extends NSObject {

	static alloc(): MKReverseGeocoder; // inherited from NSObject

	static new(): MKReverseGeocoder; // inherited from NSObject

	/* readonly */ coordinate: CLLocationCoordinate2D;

	delegate: MKReverseGeocoderDelegate;

	/* readonly */ placemark: MKPlacemark;

	/* readonly */ querying: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { coordinate: CLLocationCoordinate2D; });

	cancel(): void;

	self(): MKReverseGeocoder; // inherited from NSObjectProtocol

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

	/* readonly */ advisoryNotices: NSArray<string>;

	/* readonly */ distance: number;

	/* readonly */ expectedTravelTime: number;

	/* readonly */ name: string;

	/* readonly */ polyline: MKPolyline;

	/* readonly */ steps: NSArray<MKRouteStep>;

	/* readonly */ transportType: MKDirectionsTransportType;

	constructor(); // inherited from NSObject

	self(): MKRoute; // inherited from NSObjectProtocol
}

declare class MKRouteStep extends NSObject {

	static alloc(): MKRouteStep; // inherited from NSObject

	static new(): MKRouteStep; // inherited from NSObject

	/* readonly */ distance: number;

	/* readonly */ instructions: string;

	/* readonly */ notice: string;

	/* readonly */ polyline: MKPolyline;

	/* readonly */ transportType: MKDirectionsTransportType;

	constructor(); // inherited from NSObject

	self(): MKRouteStep; // inherited from NSObjectProtocol
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

	/* readonly */ coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	constructor(); // inherited from NSObject

	self(): MKShape; // inherited from NSObjectProtocol

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void; // inherited from MKAnnotation
}

declare class MKTileOverlay extends NSObject implements MKOverlay {

	static alloc(): MKTileOverlay; // inherited from NSObject

	static new(): MKTileOverlay; // inherited from NSObject

	/* readonly */ URLTemplate: string;

	canReplaceMapContent: boolean;

	geometryFlipped: boolean;

	maximumZ: number;

	minimumZ: number;

	tileSize: CGSize;

	/* readonly */ boundingMapRect: MKMapRect; // inherited from MKOverlay

	/* readonly */ coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	/* readonly */ subtitle: string; // inherited from MKAnnotation

	/* readonly */ title: string; // inherited from MKAnnotation

	constructor(); // inherited from NSObject

	constructor(o: { URLTemplate: string; });

	URLForTilePath(path: MKTileOverlayPath): NSURL;

	intersectsMapRect(mapRect: MKMapRect): boolean; // inherited from MKOverlay

	loadTileAtPathResult(path: MKTileOverlayPath, result: (p1: NSData, p2: NSError) => void): void;

	self(): MKTileOverlay; // inherited from NSObjectProtocol

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void; // inherited from MKAnnotation
}

interface MKTileOverlayPath {
	x: number;
	y: number;
	z: number;
	contentScaleFactor: number;
}
declare var MKTileOverlayPath: interop.StructType<MKTileOverlayPath>;

declare class MKTileOverlayRenderer extends MKOverlayRenderer {

	constructor(o: { overlay: MKOverlay; }); // inherited from MKOverlayRenderer

	constructor(o: { tileOverlay: MKTileOverlay; });

	reloadData(): void;
}

declare class MKUserLocation extends NSObject implements MKAnnotation {

	static alloc(): MKUserLocation; // inherited from NSObject

	static new(): MKUserLocation; // inherited from NSObject

	/* readonly */ heading: CLHeading;

	/* readonly */ location: CLLocation;

	subtitle: string;

	title: string;

	/* readonly */ updating: boolean;

	/* readonly */ coordinate: CLLocationCoordinate2D; // inherited from MKAnnotation

	constructor(); // inherited from NSObject

	self(): MKUserLocation; // inherited from NSObjectProtocol

	setCoordinate(newCoordinate: CLLocationCoordinate2D): void; // inherited from MKAnnotation
}

declare class MKUserTrackingBarButtonItem extends UIBarButtonItem {

	mapView: MKMapView;

	constructor(o: { barButtonSystemItem: UIBarButtonSystemItem; target: any; action: string; }); // inherited from UIBarButtonItem

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { customView: UIView; }); // inherited from UIBarButtonItem

	constructor(o: { image: UIImage; landscapeImagePhone: UIImage; style: UIBarButtonItemStyle; target: any; action: string; }); // inherited from UIBarButtonItem

	constructor(o: { image: UIImage; style: UIBarButtonItemStyle; target: any; action: string; }); // inherited from UIBarButtonItem

	constructor(o: { mapView: MKMapView; });

	constructor(o: { title: string; style: UIBarButtonItemStyle; target: any; action: string; }); // inherited from UIBarButtonItem
}

declare const enum MKUserTrackingMode {

	None = 0,

	Follow = 1,

	FollowWithHeading = 2
}
