
interface GCAcceleration {
	x: number;
	y: number;
	z: number;
}
declare var GCAcceleration: interop.StructType<GCAcceleration>;

/**
 * @since 17.4
 */
interface GCAxis2DInput extends NSObjectProtocol {

	analog: boolean;

	canWrap: boolean;

	lastValueLatency: number;

	lastValueTimestamp: number;

	sources: NSSet<GCPhysicalInputSource>;

	value: GCPoint2;

	valueDidChangeHandler: (p1: GCPhysicalInputElement, p2: GCAxis2DInput, p3: GCPoint2) => void;
}
declare var GCAxis2DInput: {

	prototype: GCAxis2DInput;
};

/**
 * @since 16.0
 */
interface GCAxisElement extends GCPhysicalInputElement {

	absoluteInput: GCAxisInput;

	relativeInput: GCRelativeInput;
}
declare var GCAxisElement: {

	prototype: GCAxisElement;
};

interface GCAxisElementName extends GCPhysicalInputElementName {
}
declare var GCAxisElementName: {

	prototype: GCAxisElementName;
};

/**
 * @since 16.0
 */
interface GCAxisInput extends NSObjectProtocol {

	analog: boolean;

	canWrap: boolean;

	lastValueLatency: number;

	lastValueTimestamp: number;

	/**
	 * @since 17.0
	 */
	sources: NSSet<GCPhysicalInputSource>;

	value: number;

	valueDidChangeHandler: (p1: GCPhysicalInputElement, p2: GCAxisInput, p3: number) => void;
}
declare var GCAxisInput: {

	prototype: GCAxisInput;
};

/**
 * @since 16.0
 */
interface GCButtonElement extends GCPhysicalInputElement {

	pressedInput: any;

	touchedInput: GCTouchedStateInput;
}
declare var GCButtonElement: {

	prototype: GCButtonElement;
};

interface GCButtonElementName extends GCPhysicalInputElementName {
}
declare var GCButtonElementName: {

	prototype: GCButtonElementName;
};

/**
 * @since 14.0
 */
declare class GCColor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): GCColor; // inherited from NSObject

	static new(): GCColor; // inherited from NSObject

	readonly blue: number;

	readonly green: number;

	readonly red: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { red: number; green: number; blue: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRedGreenBlue(red: number, green: number, blue: number): this;
}

/**
 * @since 7.0
 */
declare class GCController extends NSObject implements GCDevice {

	static alloc(): GCController; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static controllerWithExtendedGamepad(): GCController;

	/**
	 * @since 13.0
	 */
	static controllerWithMicroGamepad(): GCController;

	static controllers(): NSArray<GCController>;

	static new(): GCController; // inherited from NSObject

	static startWirelessControllerDiscoveryWithCompletionHandler(completionHandler: () => void): void;

	static stopWirelessControllerDiscovery(): void;

	readonly attachedToDevice: boolean;

	/**
	 * @since 14.0
	 */
	readonly battery: GCDeviceBattery;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	controllerPausedHandler: (p1: GCController) => void;

	readonly extendedGamepad: GCExtendedGamepad;

	/**
	 * @since 7.0
	 * @deprecated 10.0
	 */
	readonly gamepad: GCGamepad;

	/**
	 * @since 14.0
	 */
	readonly haptics: GCDeviceHaptics;

	/**
	 * @since 17.0
	 */
	readonly input: GCControllerLiveInput;

	/**
	 * @since 14.0
	 */
	readonly light: GCDeviceLight;

	readonly microGamepad: GCMicroGamepad;

	/**
	 * @since 8.0
	 */
	readonly motion: GCMotion;

	playerIndex: GCControllerPlayerIndex;

	/**
	 * @since 13.0
	 */
	readonly snapshot: boolean;

	/**
	 * @since 14.0
	 */
	static readonly current: GCController;

	/**
	 * @since 14.5
	 */
	static shouldMonitorBackgroundEvents: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	handlerQueue: NSObject & OS_dispatch_queue; // inherited from GCDevice

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	readonly physicalInputProfile: GCPhysicalInputProfile; // inherited from GCDevice

	/**
	 * @since 13.0
	 */
	readonly productCategory: string; // inherited from GCDevice

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	readonly vendorName: string; // inherited from GCDevice

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 13.0
	 */
	capture(): GCController;

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
 * @since 7.0
 */
declare class GCControllerAxisInput extends GCControllerElement {

	static alloc(): GCControllerAxisInput; // inherited from NSObject

	static new(): GCControllerAxisInput; // inherited from NSObject

	readonly value: number;

	valueChangedHandler: (p1: GCControllerAxisInput, p2: number) => void;

	/**
	 * @since 13.0
	 */
	setValue(value: number): void;
}

/**
 * @since 7.0
 */
declare class GCControllerButtonInput extends GCControllerElement {

	static alloc(): GCControllerButtonInput; // inherited from NSObject

	static new(): GCControllerButtonInput; // inherited from NSObject

	readonly pressed: boolean;

	/**
	 * @since 8.0
	 */
	pressedChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean) => void;

	readonly touched: boolean;

	/**
	 * @since 14.0
	 */
	touchedChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean, p4: boolean) => void;

	readonly value: number;

	valueChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean) => void;

	/**
	 * @since 13.0
	 */
	setValue(value: number): void;
}

/**
 * @since 14.0
 */
declare var GCControllerDidBecomeCurrentNotification: string;

/**
 * @since 7.0
 */
declare var GCControllerDidConnectNotification: string;

/**
 * @since 7.0
 */
declare var GCControllerDidDisconnectNotification: string;

/**
 * @since 14.0
 */
declare var GCControllerDidStopBeingCurrentNotification: string;

/**
 * @since 7.0
 */
declare class GCControllerDirectionPad extends GCControllerElement {

	static alloc(): GCControllerDirectionPad; // inherited from NSObject

	static new(): GCControllerDirectionPad; // inherited from NSObject

	readonly down: GCControllerButtonInput;

	readonly left: GCControllerButtonInput;

	readonly right: GCControllerButtonInput;

	readonly up: GCControllerButtonInput;

	valueChangedHandler: (p1: GCControllerDirectionPad, p2: number, p3: number) => void;

	readonly xAxis: GCControllerAxisInput;

	readonly yAxis: GCControllerAxisInput;

	/**
	 * @since 13.0
	 */
	setValueForXAxisYAxis(xAxis: number, yAxis: number): void;
}

/**
 * @since 7.0
 */
declare class GCControllerElement extends NSObject {

	static alloc(): GCControllerElement; // inherited from NSObject

	static new(): GCControllerElement; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly aliases: NSSet<string>;

	readonly analog: boolean;

	/**
	 * @since 14.0
	 */
	readonly boundToSystemGesture: boolean;

	readonly collection: GCControllerElement;

	/**
	 * @since 14.0
	 */
	localizedName: string;

	/**
	 * @since 14.0
	 */
	preferredSystemGestureState: GCSystemGestureState;

	/**
	 * @since 14.0
	 */
	sfSymbolsName: string;

	/**
	 * @since 14.0
	 */
	unmappedLocalizedName: string;

	/**
	 * @since 14.0
	 */
	unmappedSfSymbolsName: string;
}

/**
 * @since 17.0
 */
declare class GCControllerInputState extends NSObject implements GCDevicePhysicalInputState {

	static alloc(): GCControllerInputState; // inherited from NSObject

	static new(): GCControllerInputState; // inherited from NSObject

	readonly axes: GCPhysicalInputElementCollection<string, GCAxisElement>; // inherited from GCDevicePhysicalInputState

	readonly buttons: GCPhysicalInputElementCollection<string, GCButtonElement>; // inherited from GCDevicePhysicalInputState

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly device: GCDevice; // inherited from GCDevicePhysicalInputState

	readonly dpads: GCPhysicalInputElementCollection<string, GCDirectionPadElement>; // inherited from GCDevicePhysicalInputState

	readonly elements: GCPhysicalInputElementCollection<string, GCPhysicalInputElement>; // inherited from GCDevicePhysicalInputState

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly lastEventLatency: number; // inherited from GCDevicePhysicalInputState

	readonly lastEventTimestamp: number; // inherited from GCDevicePhysicalInputState

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly switches: GCPhysicalInputElementCollection<string, GCSwitchElement>; // inherited from GCDevicePhysicalInputState

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	objectForKeyedSubscript(key: string): GCPhysicalInputElement;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 17.0
 */
declare class GCControllerLiveInput extends GCControllerInputState implements GCDevicePhysicalInput {

	static alloc(): GCControllerLiveInput; // inherited from NSObject

	static new(): GCControllerLiveInput; // inherited from NSObject

	readonly unmappedInput: GCControllerLiveInput;

	readonly axes: GCPhysicalInputElementCollection<string, GCAxisElement>; // inherited from GCDevicePhysicalInputState

	readonly buttons: GCPhysicalInputElementCollection<string, GCButtonElement>; // inherited from GCDevicePhysicalInputState

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly device: GCDevice; // inherited from GCDevicePhysicalInputState

	readonly dpads: GCPhysicalInputElementCollection<string, GCDirectionPadElement>; // inherited from GCDevicePhysicalInputState

	elementValueDidChangeHandler: (p1: GCDevicePhysicalInput, p2: GCPhysicalInputElement) => void; // inherited from GCDevicePhysicalInput

	readonly elements: GCPhysicalInputElementCollection<string, GCPhysicalInputElement>; // inherited from GCDevicePhysicalInputState

	readonly hash: number; // inherited from NSObjectProtocol

	inputStateAvailableHandler: (p1: GCDevicePhysicalInput) => void; // inherited from GCDevicePhysicalInput

	inputStateQueueDepth: number; // inherited from GCDevicePhysicalInput

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly lastEventLatency: number; // inherited from GCDevicePhysicalInputState

	readonly lastEventTimestamp: number; // inherited from GCDevicePhysicalInputState

	/**
	 * @since 17.0
	 */
	queue: NSObject & OS_dispatch_queue; // inherited from GCDevicePhysicalInput

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly switches: GCPhysicalInputElementCollection<string, GCSwitchElement>; // inherited from GCDevicePhysicalInputState

	readonly  // inherited from NSObjectProtocol

	capture(): GCControllerInputState;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	nextInputState(): GCControllerInputState & GCDevicePhysicalInputStateDiff;

	objectForKeyedSubscript(key: string): GCPhysicalInputElement;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare const enum GCControllerPlayerIndex {

	IndexUnset = -1,

	Index1 = 0,

	Index2 = 1,

	Index3 = 2,

	Index4 = 3
}

/**
 * @since 14.0
 */
declare class GCControllerTouchpad extends GCControllerElement {

	static alloc(): GCControllerTouchpad; // inherited from NSObject

	static new(): GCControllerTouchpad; // inherited from NSObject

	readonly button: GCControllerButtonInput;

	reportsAbsoluteTouchSurfaceValues: boolean;

	touchDown: (p1: GCControllerTouchpad, p2: number, p3: number, p4: number, p5: boolean) => void;

	touchMoved: (p1: GCControllerTouchpad, p2: number, p3: number, p4: number, p5: boolean) => void;

	readonly touchState: GCTouchState;

	readonly touchSurface: GCControllerDirectionPad;

	touchUp: (p1: GCControllerTouchpad, p2: number, p3: number, p4: number, p5: boolean) => void;

	setValueForXAxisYAxisTouchDownButtonValue(xAxis: number, yAxis: number, touchDown: boolean, buttonValue: number): void;
}

/**
 * @since 16.0
 */
declare var GCControllerUserCustomizationsDidChangeNotification: string;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare var GCCurrentExtendedGamepadSnapshotDataVersion: GCExtendedGamepadSnapshotDataVersion;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare var GCCurrentMicroGamepadSnapshotDataVersion: GCMicroGamepadSnapshotDataVersion;

/**
 * @since 14.0
 */
interface GCDevice extends NSObjectProtocol {

	/**
	 * @since 7.0
	 */
	handlerQueue: NSObject & OS_dispatch_queue;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	physicalInputProfile: GCPhysicalInputProfile;

	/**
	 * @since 13.0
	 */
	productCategory: string;

	/**
	 * @since 7.0
	 */
	vendorName: string;
}
declare var GCDevice: {

	prototype: GCDevice;
};

/**
 * @since 14.0
 */
declare class GCDeviceBattery extends NSObject {

	static alloc(): GCDeviceBattery; // inherited from NSObject

	static new(): GCDeviceBattery; // inherited from NSObject

	readonly batteryLevel: number;

	readonly batteryState: GCDeviceBatteryState;
}

declare const enum GCDeviceBatteryState {

	Unknown = -1,

	Discharging = 0,

	Charging = 1,

	Full = 2
}

/**
 * @since 14.0
 */
declare class GCDeviceCursor extends GCControllerDirectionPad {

	static alloc(): GCDeviceCursor; // inherited from NSObject

	static new(): GCDeviceCursor; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class GCDeviceHaptics extends NSObject {

	static alloc(): GCDeviceHaptics; // inherited from NSObject

	static new(): GCDeviceHaptics; // inherited from NSObject

	readonly supportedLocalities: NSSet<string>;

	createEngineWithLocality(locality: string): CHHapticEngine;
}

/**
 * @since 14.0
 */
declare class GCDeviceLight extends NSObject {

	static alloc(): GCDeviceLight; // inherited from NSObject

	static new(): GCDeviceLight; // inherited from NSObject

	color: GCColor;
}

/**
 * @since 16.0
 */
interface GCDevicePhysicalInput extends GCDevicePhysicalInputState {

	elementValueDidChangeHandler: (p1: GCDevicePhysicalInput, p2: GCPhysicalInputElement) => void;

	inputStateAvailableHandler: (p1: GCDevicePhysicalInput) => void;

	inputStateQueueDepth: number;

	/**
	 * @since 17.0
	 */
	queue: NSObject & OS_dispatch_queue;

	capture(): GCDevicePhysicalInputState;

	nextInputState(): any;
}
declare var GCDevicePhysicalInput: {

	prototype: GCDevicePhysicalInput;
};

declare const enum GCDevicePhysicalInputElementChange {

	UnknownChange = -1,

	NoChange = 0,

	Changed = 1
}

/**
 * @since 16.0
 */
interface GCDevicePhysicalInputState extends NSObjectProtocol {

	axes: GCPhysicalInputElementCollection<string, GCAxisElement>;

	buttons: GCPhysicalInputElementCollection<string, GCButtonElement>;

	device: GCDevice;

	dpads: GCPhysicalInputElementCollection<string, GCDirectionPadElement>;

	elements: GCPhysicalInputElementCollection<string, GCPhysicalInputElement>;

	lastEventLatency: number;

	lastEventTimestamp: number;

	switches: GCPhysicalInputElementCollection<string, GCSwitchElement>;

	objectForKeyedSubscript(key: string): GCPhysicalInputElement;
}
declare var GCDevicePhysicalInputState: {

	prototype: GCDevicePhysicalInputState;
};

/**
 * @since 16.0
 */
interface GCDevicePhysicalInputStateDiff extends NSObjectProtocol {

	changeForElement(element: GCPhysicalInputElement): GCDevicePhysicalInputElementChange;

	changedElements(): NSEnumerator<GCPhysicalInputElement>;
}
declare var GCDevicePhysicalInputStateDiff: {

	prototype: GCDevicePhysicalInputStateDiff;
};

/**
 * @since 16.0
 */
interface GCDirectionPadElement extends GCPhysicalInputElement {

	down: any;

	left: any;

	right: any;

	up: any;

	xAxis: GCAxisInput;

	/**
	 * @since 17.4
	 */
	xyAxes: GCAxis2DInput;

	yAxis: GCAxisInput;
}
declare var GCDirectionPadElement: {

	prototype: GCDirectionPadElement;
};

interface GCDirectionPadElementName extends GCPhysicalInputElementName {
}
declare var GCDirectionPadElementName: {

	prototype: GCDirectionPadElementName;
};

/**
 * @since 14.3
 */
declare class GCDirectionalGamepad extends GCMicroGamepad {

	static alloc(): GCDirectionalGamepad; // inherited from NSObject

	static new(): GCDirectionalGamepad; // inherited from NSObject
}

/**
 * @since 14.5
 */
declare class GCDualSenseAdaptiveTrigger extends GCControllerButtonInput {

	static alloc(): GCDualSenseAdaptiveTrigger; // inherited from NSObject

	static new(): GCDualSenseAdaptiveTrigger; // inherited from NSObject

	readonly armPosition: number;

	readonly mode: GCDualSenseAdaptiveTriggerMode;

	readonly status: GCDualSenseAdaptiveTriggerStatus;

	/**
	 * @since 15.4
	 */
	setModeFeedbackWithResistiveStrengths(positionalResistiveStrengths: GCDualSenseAdaptiveTriggerPositionalResistiveStrengths): void;

	setModeFeedbackWithStartPositionResistiveStrength(startPosition: number, resistiveStrength: number): void;

	setModeOff(): void;

	/**
	 * @since 15.4
	 */
	setModeSlopeFeedbackWithStartPositionEndPositionStartStrengthEndStrength(startPosition: number, endPosition: number, startStrength: number, endStrength: number): void;

	/**
	 * @since 15.4
	 */
	setModeVibrationWithAmplitudesFrequency(positionalAmplitudes: GCDualSenseAdaptiveTriggerPositionalAmplitudes, frequency: number): void;

	setModeVibrationWithStartPositionAmplitudeFrequency(startPosition: number, amplitude: number, frequency: number): void;

	setModeWeaponWithStartPositionEndPositionResistiveStrength(startPosition: number, endPosition: number, resistiveStrength: number): void;
}

declare const GCDualSenseAdaptiveTriggerDiscretePositionCount: number;

/**
 * @since 14.5
 */
declare const enum GCDualSenseAdaptiveTriggerMode {

	Off = 0,

	Feedback = 1,

	Weapon = 2,

	Vibration = 3,

	SlopeFeedback = 4
}

interface GCDualSenseAdaptiveTriggerPositionalAmplitudes {
	values: interop.Reference<number>;
}
declare var GCDualSenseAdaptiveTriggerPositionalAmplitudes: interop.StructType<GCDualSenseAdaptiveTriggerPositionalAmplitudes>;

interface GCDualSenseAdaptiveTriggerPositionalResistiveStrengths {
	values: interop.Reference<number>;
}
declare var GCDualSenseAdaptiveTriggerPositionalResistiveStrengths: interop.StructType<GCDualSenseAdaptiveTriggerPositionalResistiveStrengths>;

/**
 * @since 14.5
 */
declare const enum GCDualSenseAdaptiveTriggerStatus {

	Unknown = -1,

	FeedbackNoLoad = 0,

	FeedbackLoadApplied = 1,

	WeaponReady = 2,

	WeaponFiring = 3,

	WeaponFired = 4,

	VibrationNotVibrating = 5,

	VibrationIsVibrating = 6,

	SlopeFeedbackReady = 7,

	SlopeFeedbackApplyingLoad = 8,

	SlopeFeedbackFinished = 9
}

/**
 * @since 14.5
 */
declare class GCDualSenseGamepad extends GCExtendedGamepad {

	static alloc(): GCDualSenseGamepad; // inherited from NSObject

	static new(): GCDualSenseGamepad; // inherited from NSObject

	readonly leftTrigger: GCDualSenseAdaptiveTrigger;

	readonly rightTrigger: GCDualSenseAdaptiveTrigger;

	readonly touchpadButton: GCControllerButtonInput;

	readonly touchpadPrimary: GCControllerDirectionPad;

	readonly touchpadSecondary: GCControllerDirectionPad;
}

/**
 * @since 14.0
 */
declare class GCDualShockGamepad extends GCExtendedGamepad {

	static alloc(): GCDualShockGamepad; // inherited from NSObject

	static new(): GCDualShockGamepad; // inherited from NSObject

	readonly touchpadButton: GCControllerButtonInput;

	readonly touchpadPrimary: GCControllerDirectionPad;

	readonly touchpadSecondary: GCControllerDirectionPad;
}

interface GCEulerAngles {
	pitch: number;
	yaw: number;
	roll: number;
}
declare var GCEulerAngles: interop.StructType<GCEulerAngles>;

/**
 * @since 18.0
 */
declare class GCEventInteraction extends NSObject implements UIInteraction {

	static alloc(): GCEventInteraction; // inherited from NSObject

	static new(): GCEventInteraction; // inherited from NSObject

	handledEventTypes: GCUIEventTypes;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly view: UIView; // inherited from UIInteraction

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	didMoveToView(view: UIView): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	willMoveToView(view: UIView): void;
}

/**
 * @since 9.0
 */
declare class GCEventViewController extends UIViewController {

	static alloc(): GCEventViewController; // inherited from NSObject

	static new(): GCEventViewController; // inherited from NSObject

	controllerUserInteractionEnabled: boolean;
}

/**
 * @since 7.0
 */
declare class GCExtendedGamepad extends GCPhysicalInputProfile {

	static alloc(): GCExtendedGamepad; // inherited from NSObject

	static new(): GCExtendedGamepad; // inherited from NSObject

	readonly buttonA: GCControllerButtonInput;

	readonly buttonB: GCControllerButtonInput;

	/**
	 * @since 14.0
	 */
	readonly buttonHome: GCControllerButtonInput;

	/**
	 * @since 13.0
	 */
	readonly buttonMenu: GCControllerButtonInput;

	/**
	 * @since 13.0
	 */
	readonly buttonOptions: GCControllerButtonInput;

	readonly buttonX: GCControllerButtonInput;

	readonly buttonY: GCControllerButtonInput;

	readonly controller: GCController;

	readonly dpad: GCControllerDirectionPad;

	readonly leftShoulder: GCControllerButtonInput;

	readonly leftThumbstick: GCControllerDirectionPad;

	/**
	 * @since 12.1
	 */
	readonly leftThumbstickButton: GCControllerButtonInput;

	readonly leftTrigger: GCControllerButtonInput;

	readonly rightShoulder: GCControllerButtonInput;

	readonly rightThumbstick: GCControllerDirectionPad;

	/**
	 * @since 12.1
	 */
	readonly rightThumbstickButton: GCControllerButtonInput;

	readonly rightTrigger: GCControllerButtonInput;

	valueChangedHandler: (p1: GCExtendedGamepad, p2: GCControllerElement) => void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	saveSnapshot(): GCExtendedGamepadSnapshot;

	/**
	 * @since 13.0
	 */
	setStateFromExtendedGamepad(extendedGamepad: GCExtendedGamepad): void;
}

interface GCExtendedGamepadSnapShotDataV100 {
	version: number;
	size: number;
	dpadX: number;
	dpadY: number;
	buttonA: number;
	buttonB: number;
	buttonX: number;
	buttonY: number;
	leftShoulder: number;
	rightShoulder: number;
	leftThumbstickX: number;
	leftThumbstickY: number;
	rightThumbstickX: number;
	rightThumbstickY: number;
	leftTrigger: number;
	rightTrigger: number;
}
declare var GCExtendedGamepadSnapShotDataV100: interop.StructType<GCExtendedGamepadSnapShotDataV100>;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function GCExtendedGamepadSnapShotDataV100FromNSData(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapShotDataV100>, data: NSData): boolean;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare class GCExtendedGamepadSnapshot extends GCExtendedGamepad {

	static alloc(): GCExtendedGamepadSnapshot; // inherited from NSObject

	static new(): GCExtendedGamepadSnapshot; // inherited from NSObject

	snapshotData: NSData;

	constructor(o: { controller: GCController; snapshotData: NSData; });

	constructor(o: { snapshotData: NSData; });

	initWithControllerSnapshotData(controller: GCController, data: NSData): this;

	initWithSnapshotData(data: NSData): this;
}

interface GCExtendedGamepadSnapshotData {
	version: number;
	size: number;
	dpadX: number;
	dpadY: number;
	buttonA: number;
	buttonB: number;
	buttonX: number;
	buttonY: number;
	leftShoulder: number;
	rightShoulder: number;
	leftThumbstickX: number;
	leftThumbstickY: number;
	rightThumbstickX: number;
	rightThumbstickY: number;
	leftTrigger: number;
	rightTrigger: number;
	supportsClickableThumbsticks: boolean;
	leftThumbstickButton: boolean;
	rightThumbstickButton: boolean;
}
declare var GCExtendedGamepadSnapshotData: interop.StructType<GCExtendedGamepadSnapshotData>;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function GCExtendedGamepadSnapshotDataFromNSData(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapshotData>, data: NSData): boolean;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare const enum GCExtendedGamepadSnapshotDataVersion {

	Version1 = 256,

	Version2 = 257
}

/**
 * @since 18.0
 */
declare class GCGameControllerActivationContext extends NSObject {

	static alloc(): GCGameControllerActivationContext; // inherited from NSObject

	static new(): GCGameControllerActivationContext; // inherited from NSObject

	readonly previousApplicationBundleID: string;
}

/**
 * @since 18.0
 */
interface GCGameControllerSceneDelegate extends NSObjectProtocol {

	sceneDidActivateGameControllerWithContext(scene: UIScene, context: GCGameControllerActivationContext): void;
}
declare var GCGameControllerSceneDelegate: {

	prototype: GCGameControllerSceneDelegate;
};

/**
 * @since 7.0
 * @deprecated 10.0
 */
declare class GCGamepad extends GCPhysicalInputProfile {

	static alloc(): GCGamepad; // inherited from NSObject

	static new(): GCGamepad; // inherited from NSObject

	readonly buttonA: GCControllerButtonInput;

	readonly buttonB: GCControllerButtonInput;

	readonly buttonX: GCControllerButtonInput;

	readonly buttonY: GCControllerButtonInput;

	readonly controller: GCController;

	readonly dpad: GCControllerDirectionPad;

	readonly leftShoulder: GCControllerButtonInput;

	readonly rightShoulder: GCControllerButtonInput;

	valueChangedHandler: (p1: GCGamepad, p2: GCControllerElement) => void;

	saveSnapshot(): GCGamepadSnapshot;
}

interface GCGamepadSnapShotDataV100 {
	version: number;
	size: number;
	dpadX: number;
	dpadY: number;
	buttonA: number;
	buttonB: number;
	buttonX: number;
	buttonY: number;
	leftShoulder: number;
	rightShoulder: number;
}
declare var GCGamepadSnapShotDataV100: interop.StructType<GCGamepadSnapShotDataV100>;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare function GCGamepadSnapShotDataV100FromNSData(snapshotData: interop.Pointer | interop.Reference<GCGamepadSnapShotDataV100>, data: NSData): boolean;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare class GCGamepadSnapshot extends GCGamepad {

	static alloc(): GCGamepadSnapshot; // inherited from NSObject

	static new(): GCGamepadSnapshot; // inherited from NSObject

	snapshotData: NSData;

	constructor(o: { controller: GCController; snapshotData: NSData; });

	constructor(o: { snapshotData: NSData; });

	initWithControllerSnapshotData(controller: GCController, data: NSData): this;

	initWithSnapshotData(data: NSData): this;
}

/**
 * @since 14.0
 */
declare var GCHapticDurationInfinite: number;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityAll: string;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityDefault: string;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityHandles: string;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityLeftHandle: string;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityLeftTrigger: string;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityRightHandle: string;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityRightTrigger: string;

/**
 * @since 14.0
 */
declare var GCHapticsLocalityTriggers: string;

/**
 * @since 16.0
 */
declare function GCInputArcadeButtonName(row: number, column: number): string;

/**
 * @since 17.4
 */
declare function GCInputBackLeftButton(position: number): string;

/**
 * @since 17.4
 */
declare function GCInputBackRightButton(position: number): string;

/**
 * @since 14.0
 */
declare var GCInputButtonA: string;

/**
 * @since 14.0
 */
declare var GCInputButtonB: string;

/**
 * @since 14.0
 */
declare var GCInputButtonHome: string;

/**
 * @since 14.0
 */
declare var GCInputButtonMenu: string;

/**
 * @since 14.0
 */
declare var GCInputButtonOptions: string;

/**
 * @since 15.0
 */
declare var GCInputButtonShare: string;

/**
 * @since 14.0
 */
declare var GCInputButtonX: string;

/**
 * @since 14.0
 */
declare var GCInputButtonY: string;

/**
 * @since 14.0
 */
declare var GCInputDirectionPad: string;

/**
 * @since 14.5
 */
declare var GCInputDirectionalCardinalDpad: string;

/**
 * @since 15.0
 */
declare var GCInputDirectionalCenterButton: string;

/**
 * @since 14.5
 */
declare var GCInputDirectionalDpad: string;

/**
 * @since 15.0
 */
declare var GCInputDirectionalTouchSurfaceButton: string;

/**
 * @since 14.0
 */
declare var GCInputDualShockTouchpadButton: string;

/**
 * @since 14.0
 */
declare var GCInputDualShockTouchpadOne: string;

/**
 * @since 14.0
 */
declare var GCInputDualShockTouchpadTwo: string;

/**
 * @since 17.4
 */
declare var GCInputLeftBumper: string;

/**
 * @since 14.0
 */
declare var GCInputLeftShoulder: string;

/**
 * @since 14.0
 */
declare var GCInputLeftThumbstick: string;

/**
 * @since 14.0
 */
declare var GCInputLeftThumbstickButton: string;

/**
 * @since 14.0
 */
declare var GCInputLeftTrigger: string;

/**
 * @since 15.0
 */
declare var GCInputMicroGamepadButtonA: string;

/**
 * @since 15.0
 */
declare var GCInputMicroGamepadButtonMenu: string;

/**
 * @since 15.0
 */
declare var GCInputMicroGamepadButtonX: string;

/**
 * @since 15.0
 */
declare var GCInputMicroGamepadDpad: string;

/**
 * @since 17.4
 */
declare var GCInputRightBumper: string;

/**
 * @since 14.0
 */
declare var GCInputRightShoulder: string;

/**
 * @since 14.0
 */
declare var GCInputRightThumbstick: string;

/**
 * @since 14.0
 */
declare var GCInputRightThumbstickButton: string;

/**
 * @since 14.0
 */
declare var GCInputRightTrigger: string;

/**
 * @since 14.0
 */
declare var GCInputXboxPaddleFour: string;

/**
 * @since 14.0
 */
declare var GCInputXboxPaddleOne: string;

/**
 * @since 14.0
 */
declare var GCInputXboxPaddleThree: string;

/**
 * @since 14.0
 */
declare var GCInputXboxPaddleTwo: string;

/**
 * @since 14.0
 */
declare var GCKeyA: string;

/**
 * @since 14.0
 */
declare var GCKeyApplication: string;

/**
 * @since 14.0
 */
declare var GCKeyB: string;

/**
 * @since 14.0
 */
declare var GCKeyBackslash: string;

/**
 * @since 14.0
 */
declare var GCKeyC: string;

/**
 * @since 14.0
 */
declare var GCKeyCapsLock: string;

/**
 * @since 14.0
 */
declare var GCKeyCloseBracket: string;

/**
 * @since 14.0
 */
declare var GCKeyCodeApplication: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeBackslash: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeCapsLock: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeCloseBracket: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeComma: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeDeleteForward: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeDeleteOrBackspace: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeDownArrow: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeEight: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeEnd: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeEqualSign: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeEscape: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF1: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF10: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF11: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF12: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF13: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF14: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF15: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF16: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF17: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF18: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF19: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF2: number;

/**
 * @since 15.0
 */
declare var GCKeyCodeF20: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF3: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF4: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF5: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF6: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF7: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF8: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeF9: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeFive: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeFour: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeGraveAccentAndTilde: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeHome: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeHyphen: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInsert: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational1: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational2: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational3: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational4: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational5: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational6: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational7: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational8: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeInternational9: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyA: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyB: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyC: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyD: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyE: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyF: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyG: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyH: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyI: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyJ: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyK: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyL: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyM: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyN: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyO: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyP: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyQ: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyR: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyS: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyT: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyU: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyV: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyW: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyX: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyY: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeyZ: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad0: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad1: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad2: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad3: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad4: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad5: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad6: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad7: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad8: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypad9: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadAsterisk: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadEnter: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadEqualSign: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadHyphen: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadNumLock: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadPeriod: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadPlus: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeKeypadSlash: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG1: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG2: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG3: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG4: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG5: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG6: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG7: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG8: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLANG9: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLeftAlt: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLeftArrow: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLeftControl: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLeftGUI: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeLeftShift: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeNine: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeNonUSBackslash: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeNonUSPound: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeOne: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeOpenBracket: number;

/**
 * @since 14.0
 */
declare var GCKeyCodePageDown: number;

/**
 * @since 14.0
 */
declare var GCKeyCodePageUp: number;

/**
 * @since 14.0
 */
declare var GCKeyCodePause: number;

/**
 * @since 14.0
 */
declare var GCKeyCodePeriod: number;

/**
 * @since 14.0
 */
declare var GCKeyCodePower: number;

/**
 * @since 14.0
 */
declare var GCKeyCodePrintScreen: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeQuote: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeReturnOrEnter: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeRightAlt: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeRightArrow: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeRightControl: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeRightGUI: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeRightShift: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeScrollLock: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeSemicolon: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeSeven: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeSix: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeSlash: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeSpacebar: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeTab: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeThree: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeTwo: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeUpArrow: number;

/**
 * @since 14.0
 */
declare var GCKeyCodeZero: number;

/**
 * @since 14.0
 */
declare var GCKeyComma: string;

/**
 * @since 14.0
 */
declare var GCKeyD: string;

/**
 * @since 14.0
 */
declare var GCKeyDeleteForward: string;

/**
 * @since 14.0
 */
declare var GCKeyDeleteOrBackspace: string;

/**
 * @since 14.0
 */
declare var GCKeyDownArrow: string;

/**
 * @since 14.0
 */
declare var GCKeyE: string;

/**
 * @since 14.0
 */
declare var GCKeyEight: string;

/**
 * @since 14.0
 */
declare var GCKeyEnd: string;

/**
 * @since 14.0
 */
declare var GCKeyEqualSign: string;

/**
 * @since 14.0
 */
declare var GCKeyEscape: string;

/**
 * @since 14.0
 */
declare var GCKeyF: string;

/**
 * @since 14.0
 */
declare var GCKeyF1: string;

/**
 * @since 14.0
 */
declare var GCKeyF10: string;

/**
 * @since 14.0
 */
declare var GCKeyF11: string;

/**
 * @since 14.0
 */
declare var GCKeyF12: string;

/**
 * @since 15.0
 */
declare var GCKeyF13: string;

/**
 * @since 15.0
 */
declare var GCKeyF14: string;

/**
 * @since 15.0
 */
declare var GCKeyF15: string;

/**
 * @since 15.0
 */
declare var GCKeyF16: string;

/**
 * @since 15.0
 */
declare var GCKeyF17: string;

/**
 * @since 15.0
 */
declare var GCKeyF18: string;

/**
 * @since 15.0
 */
declare var GCKeyF19: string;

/**
 * @since 14.0
 */
declare var GCKeyF2: string;

/**
 * @since 15.0
 */
declare var GCKeyF20: string;

/**
 * @since 14.0
 */
declare var GCKeyF3: string;

/**
 * @since 14.0
 */
declare var GCKeyF4: string;

/**
 * @since 14.0
 */
declare var GCKeyF5: string;

/**
 * @since 14.0
 */
declare var GCKeyF6: string;

/**
 * @since 14.0
 */
declare var GCKeyF7: string;

/**
 * @since 14.0
 */
declare var GCKeyF8: string;

/**
 * @since 14.0
 */
declare var GCKeyF9: string;

/**
 * @since 14.0
 */
declare var GCKeyFive: string;

/**
 * @since 14.0
 */
declare var GCKeyFour: string;

/**
 * @since 14.0
 */
declare var GCKeyG: string;

/**
 * @since 14.0
 */
declare var GCKeyGraveAccentAndTilde: string;

/**
 * @since 14.0
 */
declare var GCKeyH: string;

/**
 * @since 14.0
 */
declare var GCKeyHome: string;

/**
 * @since 14.0
 */
declare var GCKeyHyphen: string;

/**
 * @since 14.0
 */
declare var GCKeyI: string;

/**
 * @since 14.0
 */
declare var GCKeyInsert: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational1: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational2: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational3: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational4: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational5: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational6: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational7: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational8: string;

/**
 * @since 14.0
 */
declare var GCKeyInternational9: string;

/**
 * @since 14.0
 */
declare var GCKeyJ: string;

/**
 * @since 14.0
 */
declare var GCKeyK: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad0: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad1: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad2: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad3: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad4: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad5: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad6: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad7: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad8: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypad9: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadAsterisk: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadEnter: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadEqualSign: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadHyphen: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadNumLock: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadPeriod: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadPlus: string;

/**
 * @since 14.0
 */
declare var GCKeyKeypadSlash: string;

/**
 * @since 14.0
 */
declare var GCKeyL: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG1: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG2: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG3: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG4: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG5: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG6: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG7: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG8: string;

/**
 * @since 14.0
 */
declare var GCKeyLANG9: string;

/**
 * @since 14.0
 */
declare var GCKeyLeftAlt: string;

/**
 * @since 14.0
 */
declare var GCKeyLeftArrow: string;

/**
 * @since 14.0
 */
declare var GCKeyLeftControl: string;

/**
 * @since 14.0
 */
declare var GCKeyLeftGUI: string;

/**
 * @since 14.0
 */
declare var GCKeyLeftShift: string;

/**
 * @since 14.0
 */
declare var GCKeyM: string;

/**
 * @since 14.0
 */
declare var GCKeyN: string;

/**
 * @since 14.0
 */
declare var GCKeyNine: string;

/**
 * @since 14.0
 */
declare var GCKeyNonUSBackslash: string;

/**
 * @since 14.0
 */
declare var GCKeyNonUSPound: string;

/**
 * @since 14.0
 */
declare var GCKeyO: string;

/**
 * @since 14.0
 */
declare var GCKeyOne: string;

/**
 * @since 14.0
 */
declare var GCKeyOpenBracket: string;

/**
 * @since 14.0
 */
declare var GCKeyP: string;

/**
 * @since 14.0
 */
declare var GCKeyPageDown: string;

/**
 * @since 14.0
 */
declare var GCKeyPageUp: string;

/**
 * @since 14.0
 */
declare var GCKeyPause: string;

/**
 * @since 14.0
 */
declare var GCKeyPeriod: string;

/**
 * @since 14.0
 */
declare var GCKeyPower: string;

/**
 * @since 14.0
 */
declare var GCKeyPrintScreen: string;

/**
 * @since 14.0
 */
declare var GCKeyQ: string;

/**
 * @since 14.0
 */
declare var GCKeyQuote: string;

/**
 * @since 14.0
 */
declare var GCKeyR: string;

/**
 * @since 14.0
 */
declare var GCKeyReturnOrEnter: string;

/**
 * @since 14.0
 */
declare var GCKeyRightAlt: string;

/**
 * @since 14.0
 */
declare var GCKeyRightArrow: string;

/**
 * @since 14.0
 */
declare var GCKeyRightControl: string;

/**
 * @since 14.0
 */
declare var GCKeyRightGUI: string;

/**
 * @since 14.0
 */
declare var GCKeyRightShift: string;

/**
 * @since 14.0
 */
declare var GCKeyS: string;

/**
 * @since 14.0
 */
declare var GCKeyScrollLock: string;

/**
 * @since 14.0
 */
declare var GCKeySemicolon: string;

/**
 * @since 14.0
 */
declare var GCKeySeven: string;

/**
 * @since 14.0
 */
declare var GCKeySix: string;

/**
 * @since 14.0
 */
declare var GCKeySlash: string;

/**
 * @since 14.0
 */
declare var GCKeySpacebar: string;

/**
 * @since 14.0
 */
declare var GCKeyT: string;

/**
 * @since 14.0
 */
declare var GCKeyTab: string;

/**
 * @since 14.0
 */
declare var GCKeyThree: string;

/**
 * @since 14.0
 */
declare var GCKeyTwo: string;

/**
 * @since 14.0
 */
declare var GCKeyU: string;

/**
 * @since 14.0
 */
declare var GCKeyUpArrow: string;

/**
 * @since 14.0
 */
declare var GCKeyV: string;

/**
 * @since 14.0
 */
declare var GCKeyW: string;

/**
 * @since 14.0
 */
declare var GCKeyX: string;

/**
 * @since 14.0
 */
declare var GCKeyY: string;

/**
 * @since 14.0
 */
declare var GCKeyZ: string;

/**
 * @since 14.0
 */
declare var GCKeyZero: string;

/**
 * @since 14.0
 */
declare class GCKeyboard extends NSObject implements GCDevice {

	static alloc(): GCKeyboard; // inherited from NSObject

	static new(): GCKeyboard; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly keyboardInput: GCKeyboardInput;

	/**
	 * @since 14.0
	 */
	static readonly coalescedKeyboard: GCKeyboard;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	handlerQueue: NSObject & OS_dispatch_queue; // inherited from GCDevice

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	readonly physicalInputProfile: GCPhysicalInputProfile; // inherited from GCDevice

	/**
	 * @since 13.0
	 */
	readonly productCategory: string; // inherited from GCDevice

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	readonly vendorName: string; // inherited from GCDevice

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
 * @since 14.0
 */
declare var GCKeyboardDidConnectNotification: string;

/**
 * @since 14.0
 */
declare var GCKeyboardDidDisconnectNotification: string;

/**
 * @since 14.0
 */
declare class GCKeyboardInput extends GCPhysicalInputProfile {

	static alloc(): GCKeyboardInput; // inherited from NSObject

	static new(): GCKeyboardInput; // inherited from NSObject

	readonly anyKeyPressed: boolean;

	keyChangedHandler: (p1: GCKeyboardInput, p2: GCControllerButtonInput, p3: number, p4: boolean) => void;

	buttonForKeyCode(code: number): GCControllerButtonInput;
}

/**
 * @since 16.0
 */
interface GCLinearInput extends NSObjectProtocol {

	analog: boolean;

	canWrap: boolean;

	lastValueLatency: number;

	lastValueTimestamp: number;

	/**
	 * @since 17.0
	 */
	sources: NSSet<GCPhysicalInputSource>;

	value: number;

	valueDidChangeHandler: (p1: GCPhysicalInputElement, p2: GCLinearInput, p3: number) => void;
}
declare var GCLinearInput: {

	prototype: GCLinearInput;
};

/**
 * @since 9.0
 */
declare class GCMicroGamepad extends GCPhysicalInputProfile {

	static alloc(): GCMicroGamepad; // inherited from NSObject

	static new(): GCMicroGamepad; // inherited from NSObject

	allowsRotation: boolean;

	readonly buttonA: GCControllerButtonInput;

	/**
	 * @since 13.0
	 */
	readonly buttonMenu: GCControllerButtonInput;

	readonly buttonX: GCControllerButtonInput;

	readonly controller: GCController;

	readonly dpad: GCControllerDirectionPad;

	reportsAbsoluteDpadValues: boolean;

	valueChangedHandler: (p1: GCMicroGamepad, p2: GCControllerElement) => void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	saveSnapshot(): GCMicroGamepadSnapshot;

	/**
	 * @since 13.0
	 */
	setStateFromMicroGamepad(microGamepad: GCMicroGamepad): void;
}

interface GCMicroGamepadSnapShotDataV100 {
	version: number;
	size: number;
	dpadX: number;
	dpadY: number;
	buttonA: number;
	buttonX: number;
}
declare var GCMicroGamepadSnapShotDataV100: interop.StructType<GCMicroGamepadSnapShotDataV100>;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function GCMicroGamepadSnapShotDataV100FromNSData(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapShotDataV100>, data: NSData): boolean;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare class GCMicroGamepadSnapshot extends GCMicroGamepad {

	static alloc(): GCMicroGamepadSnapshot; // inherited from NSObject

	static new(): GCMicroGamepadSnapshot; // inherited from NSObject

	snapshotData: NSData;

	constructor(o: { controller: GCController; snapshotData: NSData; });

	constructor(o: { snapshotData: NSData; });

	initWithControllerSnapshotData(controller: GCController, data: NSData): this;

	initWithSnapshotData(data: NSData): this;
}

interface GCMicroGamepadSnapshotData {
	version: number;
	size: number;
	dpadX: number;
	dpadY: number;
	buttonA: number;
	buttonX: number;
}
declare var GCMicroGamepadSnapshotData: interop.StructType<GCMicroGamepadSnapshotData>;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function GCMicroGamepadSnapshotDataFromNSData(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapshotData>, data: NSData): boolean;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare const enum GCMicroGamepadSnapshotDataVersion {

	Version1 = 256
}

/**
 * @since 8.0
 */
declare class GCMotion extends NSObject {

	static alloc(): GCMotion; // inherited from NSObject

	static new(): GCMotion; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly acceleration: GCAcceleration;

	/**
	 * @since 11.0
	 */
	readonly attitude: GCQuaternion;

	readonly controller: GCController;

	readonly gravity: GCAcceleration;

	/**
	 * @since 14.0
	 */
	readonly hasAttitude: boolean;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	readonly hasAttitudeAndRotationRate: boolean;

	/**
	 * @since 14.0
	 */
	readonly hasGravityAndUserAcceleration: boolean;

	/**
	 * @since 14.0
	 */
	readonly hasRotationRate: boolean;

	/**
	 * @since 11.0
	 */
	readonly rotationRate: GCRotationRate;

	/**
	 * @since 14.0
	 */
	sensorsActive: boolean;

	/**
	 * @since 14.0
	 */
	readonly sensorsRequireManualActivation: boolean;

	readonly userAcceleration: GCAcceleration;

	valueChangedHandler: (p1: GCMotion) => void;

	/**
	 * @since 14.0
	 */
	setAcceleration(acceleration: GCAcceleration): void;

	/**
	 * @since 13.0
	 */
	setAttitude(attitude: GCQuaternion): void;

	/**
	 * @since 13.0
	 */
	setGravity(gravity: GCAcceleration): void;

	/**
	 * @since 13.0
	 */
	setRotationRate(rotationRate: GCRotationRate): void;

	/**
	 * @since 13.0
	 */
	setStateFromMotion(motion: GCMotion): void;

	/**
	 * @since 13.0
	 */
	setUserAcceleration(userAcceleration: GCAcceleration): void;
}

/**
 * @since 14.0
 */
declare class GCMouse extends NSObject implements GCDevice {

	static alloc(): GCMouse; // inherited from NSObject

	static mice(): NSArray<GCMouse>;

	static new(): GCMouse; // inherited from NSObject

	readonly mouseInput: GCMouseInput;

	static readonly current: GCMouse;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	handlerQueue: NSObject & OS_dispatch_queue; // inherited from GCDevice

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	readonly physicalInputProfile: GCPhysicalInputProfile; // inherited from GCDevice

	/**
	 * @since 13.0
	 */
	readonly productCategory: string; // inherited from GCDevice

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	/**
	 * @since 7.0
	 */
	readonly vendorName: string; // inherited from GCDevice

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
 * @since 14.0
 */
declare var GCMouseDidBecomeCurrentNotification: string;

/**
 * @since 14.0
 */
declare var GCMouseDidConnectNotification: string;

/**
 * @since 14.0
 */
declare var GCMouseDidDisconnectNotification: string;

/**
 * @since 14.0
 */
declare var GCMouseDidStopBeingCurrentNotification: string;

/**
 * @since 14.0
 */
declare class GCMouseInput extends GCPhysicalInputProfile {

	static alloc(): GCMouseInput; // inherited from NSObject

	static new(): GCMouseInput; // inherited from NSObject

	readonly auxiliaryButtons: NSArray<GCControllerButtonInput>;

	readonly leftButton: GCControllerButtonInput;

	readonly middleButton: GCControllerButtonInput;

	mouseMovedHandler: (p1: GCMouseInput, p2: number, p3: number) => void;

	readonly rightButton: GCControllerButtonInput;

	readonly scroll: GCDeviceCursor;
}

/**
 * @since 16.0
 */
interface GCPhysicalInputElement extends NSObjectProtocol {

	aliases: NSSet<string>;

	localizedName: string;

	sfSymbolsName: string;
}
declare var GCPhysicalInputElement: {

	prototype: GCPhysicalInputElement;
};

/**
 * @since 16.0
 */
declare class GCPhysicalInputElementCollection<Key, Element> extends NSObject implements NSFastEnumeration {

	static alloc<Key, Element>(): GCPhysicalInputElementCollection<Key, Element>; // inherited from NSObject

	static new<Key, Element>(): GCPhysicalInputElementCollection<Key, Element>; // inherited from NSObject

	readonly count: number;
	[Symbol.iterator](): Iterator<any>;

	elementEnumerator(): NSEnumerator<GCPhysicalInputElement>;

	elementForAlias(alias: string): GCPhysicalInputElement;

	objectForKeyedSubscript(key: string): GCPhysicalInputElement;
}

interface GCPhysicalInputElementName {
}
declare var GCPhysicalInputElementName: {

	prototype: GCPhysicalInputElementName;
};

/**
 * @since 14.0
 */
declare class GCPhysicalInputProfile extends NSObject {

	static alloc(): GCPhysicalInputProfile; // inherited from NSObject

	static new(): GCPhysicalInputProfile; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly allAxes: NSSet<GCControllerAxisInput>;

	/**
	 * @since 14.0
	 */
	readonly allButtons: NSSet<GCControllerButtonInput>;

	/**
	 * @since 14.0
	 */
	readonly allDpads: NSSet<GCControllerDirectionPad>;

	/**
	 * @since 14.0
	 */
	readonly allElements: NSSet<GCControllerElement>;

	/**
	 * @since 14.0
	 */
	readonly allTouchpads: NSSet<GCControllerTouchpad>;

	/**
	 * @since 14.0
	 */
	readonly axes: NSDictionary<string, GCControllerAxisInput>;

	/**
	 * @since 14.0
	 */
	readonly buttons: NSDictionary<string, GCControllerButtonInput>;

	/**
	 * @since 14.0
	 */
	readonly device: GCDevice;

	/**
	 * @since 14.0
	 */
	readonly dpads: NSDictionary<string, GCControllerDirectionPad>;

	/**
	 * @since 14.0
	 */
	readonly elements: NSDictionary<string, GCControllerElement>;

	/**
	 * @since 15.0
	 */
	readonly hasRemappedElements: boolean;

	/**
	 * @since 14.0
	 */
	readonly lastEventTimestamp: number;

	/**
	 * @since 14.0
	 */
	readonly touchpads: NSDictionary<string, GCControllerTouchpad>;

	/**
	 * @since 16.0
	 */
	valueDidChangeHandler: (p1: GCPhysicalInputProfile, p2: GCControllerElement) => void;

	/**
	 * @since 14.0
	 */
	capture(): this;

	/**
	 * @since 15.0
	 */
	mappedElementAliasForPhysicalInputName(inputName: string): string;

	/**
	 * @since 15.0
	 */
	mappedPhysicalInputNamesForElementAlias(elementAlias: string): NSSet<string>;

	/**
	 * @since 14.0
	 */
	objectForKeyedSubscript(key: string): GCControllerElement;

	/**
	 * @since 14.0
	 */
	setStateFromPhysicalInput(physicalInput: GCPhysicalInputProfile): void;
}

/**
 * @since 17.0
 */
interface GCPhysicalInputSource extends NSObjectProtocol {

	direction: GCPhysicalInputSourceDirection;

	elementAliases: NSSet<string>;

	elementLocalizedName: string;

	sfSymbolsName: string;
}
declare var GCPhysicalInputSource: {

	prototype: GCPhysicalInputSource;
};

declare const enum GCPhysicalInputSourceDirection {

	NotApplicable = 0,

	Up = 1,

	Right = 2,

	Down = 4,

	Left = 8
}

interface GCPoint2 {
	x: number;
	y: number;
}
declare var GCPoint2: interop.StructType<GCPoint2>;

/**
 * @since 17.4
 */
declare var GCPoint2Zero: GCPoint2;

/**
 * @since 16.0
 */
interface GCPressedStateInput extends NSObjectProtocol {

	lastPressedStateLatency: number;

	lastPressedStateTimestamp: number;

	pressed: boolean;

	pressedDidChangeHandler: (p1: GCPhysicalInputElement, p2: GCPressedStateInput, p3: boolean) => void;

	/**
	 * @since 17.0
	 */
	sources: NSSet<GCPhysicalInputSource>;
}
declare var GCPressedStateInput: {

	prototype: GCPressedStateInput;
};

/**
 * @since 17.0
 */
declare var GCProductCategoryArcadeStick: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryCoalescedRemote: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryControlCenterRemote: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryDualSense: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryDualShock4: string;

/**
 * @since 16.0
 */
declare var GCProductCategoryHID: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryKeyboard: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryMFi: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryMouse: string;

/**
 * @since 15.0
 */
declare var GCProductCategorySiriRemote1stGen: string;

/**
 * @since 15.0
 */
declare var GCProductCategorySiriRemote2ndGen: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryUniversalElectronicsRemote: string;

/**
 * @since 15.0
 */
declare var GCProductCategoryXboxOne: string;

interface GCQuaternion {
	x: number;
	y: number;
	z: number;
	w: number;
}
declare var GCQuaternion: interop.StructType<GCQuaternion>;

/**
 * @since 16.0
 */
interface GCRelativeInput extends NSObjectProtocol {

	analog: boolean;

	delta: number;

	deltaDidChangeHandler: (p1: GCPhysicalInputElement, p2: GCRelativeInput, p3: number) => void;

	lastDeltaLatency: number;

	lastDeltaTimestamp: number;

	/**
	 * @since 17.0
	 */
	sources: NSSet<GCPhysicalInputSource>;
}
declare var GCRelativeInput: {

	prototype: GCRelativeInput;
};

interface GCRotationRate {
	x: number;
	y: number;
	z: number;
}
declare var GCRotationRate: interop.StructType<GCRotationRate>;

/**
 * @since 16.0
 */
interface GCSwitchElement extends GCPhysicalInputElement {

	positionInput: GCSwitchPositionInput;
}
declare var GCSwitchElement: {

	prototype: GCSwitchElement;
};

interface GCSwitchElementName extends GCPhysicalInputElementName {
}
declare var GCSwitchElementName: {

	prototype: GCSwitchElementName;
};

/**
 * @since 16.0
 */
interface GCSwitchPositionInput extends NSObjectProtocol {

	canWrap: boolean;

	lastPositionLatency: number;

	lastPositionTimestamp: number;

	position: number;

	positionDidChangeHandler: (p1: GCPhysicalInputElement, p2: GCSwitchPositionInput, p3: number) => void;

	positionRange: NSRange;

	sequential: boolean;

	/**
	 * @since 17.0
	 */
	sources: NSSet<GCPhysicalInputSource>;
}
declare var GCSwitchPositionInput: {

	prototype: GCSwitchPositionInput;
};

declare const enum GCSystemGestureState {

	Enabled = 0,

	AlwaysReceive = 1,

	Disabled = 2
}

declare const enum GCTouchState {

	Up = 0,

	Down = 1,

	Moving = 2
}

/**
 * @since 16.0
 */
interface GCTouchedStateInput extends NSObjectProtocol {

	lastTouchedStateLatency: number;

	lastTouchedStateTimestamp: number;

	/**
	 * @since 17.0
	 */
	sources: NSSet<GCPhysicalInputSource>;

	touched: boolean;

	touchedDidChangeHandler: (p1: GCPhysicalInputElement, p2: GCTouchedStateInput, p3: boolean) => void;
}
declare var GCTouchedStateInput: {

	prototype: GCTouchedStateInput;
};

declare const enum GCUIEventTypes {

	None = 0,

	Gamepad = 1
}

/**
 * @since 15.0
 */
declare class GCVirtualController extends NSObject {

	static alloc(): GCVirtualController; // inherited from NSObject

	static new(): GCVirtualController; // inherited from NSObject

	static virtualControllerWithConfiguration(configuration: GCVirtualControllerConfiguration): GCVirtualController;

	readonly controller: GCController;

	constructor(o: { configuration: GCVirtualControllerConfiguration; });

	connectWithReplyHandler(reply: (p1: NSError) => void): void;

	disconnect(): void;

	initWithConfiguration(configuration: GCVirtualControllerConfiguration): this;

	/**
	 * @since 17.0
	 */
	setPositionForDirectionPadElement(position: CGPoint, element: string): void;

	/**
	 * @since 17.0
	 */
	setValueForButtonElement(value: number, element: string): void;

	updateConfigurationForElementConfiguration(element: string, config: (p1: GCVirtualControllerElementConfiguration) => GCVirtualControllerElementConfiguration): void;
}

/**
 * @since 15.0
 */
declare class GCVirtualControllerConfiguration extends NSObject {

	static alloc(): GCVirtualControllerConfiguration; // inherited from NSObject

	static new(): GCVirtualControllerConfiguration; // inherited from NSObject

	elements: NSSet<string>;

	/**
	 * @since 17.0
	 */
	hidden: boolean;
}

/**
 * @since 15.0
 */
declare class GCVirtualControllerElementConfiguration extends NSObject {

	static alloc(): GCVirtualControllerElementConfiguration; // inherited from NSObject

	static new(): GCVirtualControllerElementConfiguration; // inherited from NSObject

	actsAsTouchpad: boolean;

	hidden: boolean;

	path: UIBezierPath;
}

/**
 * @since 14.0
 */
declare class GCXboxGamepad extends GCExtendedGamepad {

	static alloc(): GCXboxGamepad; // inherited from NSObject

	static new(): GCXboxGamepad; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly buttonShare: GCControllerButtonInput;

	readonly paddleButton1: GCControllerButtonInput;

	readonly paddleButton2: GCControllerButtonInput;

	readonly paddleButton3: GCControllerButtonInput;

	readonly paddleButton4: GCControllerButtonInput;
}

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function NSDataFromGCExtendedGamepadSnapShotDataV100(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapShotDataV100>): NSData;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function NSDataFromGCExtendedGamepadSnapshotData(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapshotData>): NSData;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare function NSDataFromGCGamepadSnapShotDataV100(snapshotData: interop.Pointer | interop.Reference<GCGamepadSnapShotDataV100>): NSData;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function NSDataFromGCMicroGamepadSnapShotDataV100(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapShotDataV100>): NSData;

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare function NSDataFromGCMicroGamepadSnapshotData(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapshotData>): NSData;

/**
 * @since 17.4
 */
declare function NSStringFromGCPoint2(point: GCPoint2): string;
