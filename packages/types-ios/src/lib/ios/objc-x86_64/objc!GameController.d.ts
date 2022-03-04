
interface GCAcceleration {
	x: number;
	y: number;
	z: number;
}
declare var GCAcceleration: interop.StructType<GCAcceleration>;

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

declare class GCController extends NSObject implements GCDevice {

	static alloc(): GCController; // inherited from NSObject

	static controllerWithExtendedGamepad(): GCController;

	static controllerWithMicroGamepad(): GCController;

	static controllers(): NSArray<GCController>;

	static new(): GCController; // inherited from NSObject

	static startWirelessControllerDiscoveryWithCompletionHandler(completionHandler: () => void): void;

	static stopWirelessControllerDiscovery(): void;

	readonly attachedToDevice: boolean;

	readonly battery: GCDeviceBattery;

	controllerPausedHandler: (p1: GCController) => void;

	readonly extendedGamepad: GCExtendedGamepad;

	readonly gamepad: GCGamepad;

	readonly haptics: GCDeviceHaptics;

	readonly light: GCDeviceLight;

	readonly microGamepad: GCMicroGamepad;

	readonly motion: GCMotion;

	playerIndex: GCControllerPlayerIndex;

	readonly snapshot: boolean;

	static readonly current: GCController;

	static shouldMonitorBackgroundEvents: boolean;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	handlerQueue: NSObject; // inherited from GCDevice

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly physicalInputProfile: GCPhysicalInputProfile; // inherited from GCDevice

	readonly productCategory: string; // inherited from GCDevice

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly vendorName: string; // inherited from GCDevice

	readonly  // inherited from NSObjectProtocol

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

declare class GCControllerAxisInput extends GCControllerElement {

	static alloc(): GCControllerAxisInput; // inherited from NSObject

	static new(): GCControllerAxisInput; // inherited from NSObject

	readonly value: number;

	valueChangedHandler: (p1: GCControllerAxisInput, p2: number) => void;

	setValue(value: number): void;
}

declare class GCControllerButtonInput extends GCControllerElement {

	static alloc(): GCControllerButtonInput; // inherited from NSObject

	static new(): GCControllerButtonInput; // inherited from NSObject

	readonly pressed: boolean;

	pressedChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean) => void;

	readonly touched: boolean;

	touchedChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean, p4: boolean) => void;

	readonly value: number;

	valueChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean) => void;

	setValue(value: number): void;
}

declare var GCControllerDidBecomeCurrentNotification: string;

declare var GCControllerDidConnectNotification: string;

declare var GCControllerDidDisconnectNotification: string;

declare var GCControllerDidStopBeingCurrentNotification: string;

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

	setValueForXAxisYAxis(xAxis: number, yAxis: number): void;
}

declare class GCControllerElement extends NSObject {

	static alloc(): GCControllerElement; // inherited from NSObject

	static new(): GCControllerElement; // inherited from NSObject

	readonly aliases: NSSet<string>;

	readonly analog: boolean;

	readonly boundToSystemGesture: boolean;

	readonly collection: GCControllerElement;

	localizedName: string;

	preferredSystemGestureState: GCSystemGestureState;

	sfSymbolsName: string;

	unmappedLocalizedName: string;

	unmappedSfSymbolsName: string;
}

declare const enum GCControllerPlayerIndex {

	IndexUnset = -1,

	Index1 = 0,

	Index2 = 1,

	Index3 = 2,

	Index4 = 3
}

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

declare var GCCurrentExtendedGamepadSnapshotDataVersion: GCExtendedGamepadSnapshotDataVersion;

declare var GCCurrentMicroGamepadSnapshotDataVersion: GCMicroGamepadSnapshotDataVersion;

interface GCDevice extends NSObjectProtocol {

	handlerQueue: NSObject;

	physicalInputProfile: GCPhysicalInputProfile;

	productCategory: string;

	vendorName: string;
}
declare var GCDevice: {

	prototype: GCDevice;
};

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

declare class GCDeviceCursor extends GCControllerDirectionPad {

	static alloc(): GCDeviceCursor; // inherited from NSObject

	static new(): GCDeviceCursor; // inherited from NSObject
}

declare class GCDeviceHaptics extends NSObject {

	static alloc(): GCDeviceHaptics; // inherited from NSObject

	static new(): GCDeviceHaptics; // inherited from NSObject

	readonly supportedLocalities: NSSet<string>;

	createEngineWithLocality(locality: string): CHHapticEngine;
}

declare class GCDeviceLight extends NSObject {

	static alloc(): GCDeviceLight; // inherited from NSObject

	static new(): GCDeviceLight; // inherited from NSObject

	color: GCColor;
}

declare class GCDirectionalGamepad extends GCMicroGamepad {

	static alloc(): GCDirectionalGamepad; // inherited from NSObject

	static new(): GCDirectionalGamepad; // inherited from NSObject
}

declare class GCDualSenseAdaptiveTrigger extends GCControllerButtonInput {

	static alloc(): GCDualSenseAdaptiveTrigger; // inherited from NSObject

	static new(): GCDualSenseAdaptiveTrigger; // inherited from NSObject

	readonly armPosition: number;

	readonly mode: GCDualSenseAdaptiveTriggerMode;

	readonly status: GCDualSenseAdaptiveTriggerStatus;

	setModeFeedbackWithResistiveStrengths(positionalResistiveStrengths: GCDualSenseAdaptiveTriggerPositionalResistiveStrengths): void;

	setModeFeedbackWithStartPositionResistiveStrength(startPosition: number, resistiveStrength: number): void;

	setModeOff(): void;

	setModeSlopeFeedbackWithStartPositionEndPositionStartStrengthEndStrength(startPosition: number, endPosition: number, startStrength: number, endStrength: number): void;

	setModeVibrationWithAmplitudesFrequency(positionalAmplitudes: GCDualSenseAdaptiveTriggerPositionalAmplitudes, frequency: number): void;

	setModeVibrationWithStartPositionAmplitudeFrequency(startPosition: number, amplitude: number, frequency: number): void;

	setModeWeaponWithStartPositionEndPositionResistiveStrength(startPosition: number, endPosition: number, resistiveStrength: number): void;
}

declare const GCDualSenseAdaptiveTriggerDiscretePositionCount: number;

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

declare class GCDualSenseGamepad extends GCExtendedGamepad {

	static alloc(): GCDualSenseGamepad; // inherited from NSObject

	static new(): GCDualSenseGamepad; // inherited from NSObject

	readonly leftTrigger: GCDualSenseAdaptiveTrigger;

	readonly rightTrigger: GCDualSenseAdaptiveTrigger;

	readonly touchpadButton: GCControllerButtonInput;

	readonly touchpadPrimary: GCControllerDirectionPad;

	readonly touchpadSecondary: GCControllerDirectionPad;
}

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

declare class GCEventViewController extends UIViewController {

	static alloc(): GCEventViewController; // inherited from NSObject

	static new(): GCEventViewController; // inherited from NSObject

	controllerUserInteractionEnabled: boolean;
}

declare class GCExtendedGamepad extends GCPhysicalInputProfile {

	static alloc(): GCExtendedGamepad; // inherited from NSObject

	static new(): GCExtendedGamepad; // inherited from NSObject

	readonly buttonA: GCControllerButtonInput;

	readonly buttonB: GCControllerButtonInput;

	readonly buttonHome: GCControllerButtonInput;

	readonly buttonMenu: GCControllerButtonInput;

	readonly buttonOptions: GCControllerButtonInput;

	readonly buttonX: GCControllerButtonInput;

	readonly buttonY: GCControllerButtonInput;

	readonly controller: GCController;

	readonly dpad: GCControllerDirectionPad;

	readonly leftShoulder: GCControllerButtonInput;

	readonly leftThumbstick: GCControllerDirectionPad;

	readonly leftThumbstickButton: GCControllerButtonInput;

	readonly leftTrigger: GCControllerButtonInput;

	readonly rightShoulder: GCControllerButtonInput;

	readonly rightThumbstick: GCControllerDirectionPad;

	readonly rightThumbstickButton: GCControllerButtonInput;

	readonly rightTrigger: GCControllerButtonInput;

	valueChangedHandler: (p1: GCExtendedGamepad, p2: GCControllerElement) => void;

	saveSnapshot(): GCExtendedGamepadSnapshot;

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

declare function GCExtendedGamepadSnapShotDataV100FromNSData(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapShotDataV100>, data: NSData): boolean;

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

declare function GCExtendedGamepadSnapshotDataFromNSData(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapshotData>, data: NSData): boolean;

declare const enum GCExtendedGamepadSnapshotDataVersion {

	Version1 = 256,

	Version2 = 257
}

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

declare function GCGamepadSnapShotDataV100FromNSData(snapshotData: interop.Pointer | interop.Reference<GCGamepadSnapShotDataV100>, data: NSData): boolean;

declare class GCGamepadSnapshot extends GCGamepad {

	static alloc(): GCGamepadSnapshot; // inherited from NSObject

	static new(): GCGamepadSnapshot; // inherited from NSObject

	snapshotData: NSData;

	constructor(o: { controller: GCController; snapshotData: NSData; });

	constructor(o: { snapshotData: NSData; });

	initWithControllerSnapshotData(controller: GCController, data: NSData): this;

	initWithSnapshotData(data: NSData): this;
}

declare var GCHapticDurationInfinite: number;

declare var GCHapticsLocalityAll: string;

declare var GCHapticsLocalityDefault: string;

declare var GCHapticsLocalityHandles: string;

declare var GCHapticsLocalityLeftHandle: string;

declare var GCHapticsLocalityLeftTrigger: string;

declare var GCHapticsLocalityRightHandle: string;

declare var GCHapticsLocalityRightTrigger: string;

declare var GCHapticsLocalityTriggers: string;

declare var GCInputButtonA: string;

declare var GCInputButtonB: string;

declare var GCInputButtonHome: string;

declare var GCInputButtonMenu: string;

declare var GCInputButtonOptions: string;

declare var GCInputButtonShare: string;

declare var GCInputButtonX: string;

declare var GCInputButtonY: string;

declare var GCInputDirectionPad: string;

declare var GCInputDirectionalCardinalDpad: string;

declare var GCInputDirectionalCenterButton: string;

declare var GCInputDirectionalDpad: string;

declare var GCInputDirectionalTouchSurfaceButton: string;

declare var GCInputDualShockTouchpadButton: string;

declare var GCInputDualShockTouchpadOne: string;

declare var GCInputDualShockTouchpadTwo: string;

declare var GCInputLeftShoulder: string;

declare var GCInputLeftThumbstick: string;

declare var GCInputLeftThumbstickButton: string;

declare var GCInputLeftTrigger: string;

declare var GCInputMicroGamepadButtonA: string;

declare var GCInputMicroGamepadButtonMenu: string;

declare var GCInputMicroGamepadButtonX: string;

declare var GCInputMicroGamepadDpad: string;

declare var GCInputRightShoulder: string;

declare var GCInputRightThumbstick: string;

declare var GCInputRightThumbstickButton: string;

declare var GCInputRightTrigger: string;

declare var GCInputXboxPaddleFour: string;

declare var GCInputXboxPaddleOne: string;

declare var GCInputXboxPaddleThree: string;

declare var GCInputXboxPaddleTwo: string;

declare var GCKeyA: string;

declare var GCKeyApplication: string;

declare var GCKeyB: string;

declare var GCKeyBackslash: string;

declare var GCKeyC: string;

declare var GCKeyCapsLock: string;

declare var GCKeyCloseBracket: string;

declare var GCKeyCodeApplication: number;

declare var GCKeyCodeBackslash: number;

declare var GCKeyCodeCapsLock: number;

declare var GCKeyCodeCloseBracket: number;

declare var GCKeyCodeComma: number;

declare var GCKeyCodeDeleteForward: number;

declare var GCKeyCodeDeleteOrBackspace: number;

declare var GCKeyCodeDownArrow: number;

declare var GCKeyCodeEight: number;

declare var GCKeyCodeEnd: number;

declare var GCKeyCodeEqualSign: number;

declare var GCKeyCodeEscape: number;

declare var GCKeyCodeF1: number;

declare var GCKeyCodeF10: number;

declare var GCKeyCodeF11: number;

declare var GCKeyCodeF12: number;

declare var GCKeyCodeF13: number;

declare var GCKeyCodeF14: number;

declare var GCKeyCodeF15: number;

declare var GCKeyCodeF16: number;

declare var GCKeyCodeF17: number;

declare var GCKeyCodeF18: number;

declare var GCKeyCodeF19: number;

declare var GCKeyCodeF2: number;

declare var GCKeyCodeF20: number;

declare var GCKeyCodeF3: number;

declare var GCKeyCodeF4: number;

declare var GCKeyCodeF5: number;

declare var GCKeyCodeF6: number;

declare var GCKeyCodeF7: number;

declare var GCKeyCodeF8: number;

declare var GCKeyCodeF9: number;

declare var GCKeyCodeFive: number;

declare var GCKeyCodeFour: number;

declare var GCKeyCodeGraveAccentAndTilde: number;

declare var GCKeyCodeHome: number;

declare var GCKeyCodeHyphen: number;

declare var GCKeyCodeInsert: number;

declare var GCKeyCodeInternational1: number;

declare var GCKeyCodeInternational2: number;

declare var GCKeyCodeInternational3: number;

declare var GCKeyCodeInternational4: number;

declare var GCKeyCodeInternational5: number;

declare var GCKeyCodeInternational6: number;

declare var GCKeyCodeInternational7: number;

declare var GCKeyCodeInternational8: number;

declare var GCKeyCodeInternational9: number;

declare var GCKeyCodeKeyA: number;

declare var GCKeyCodeKeyB: number;

declare var GCKeyCodeKeyC: number;

declare var GCKeyCodeKeyD: number;

declare var GCKeyCodeKeyE: number;

declare var GCKeyCodeKeyF: number;

declare var GCKeyCodeKeyG: number;

declare var GCKeyCodeKeyH: number;

declare var GCKeyCodeKeyI: number;

declare var GCKeyCodeKeyJ: number;

declare var GCKeyCodeKeyK: number;

declare var GCKeyCodeKeyL: number;

declare var GCKeyCodeKeyM: number;

declare var GCKeyCodeKeyN: number;

declare var GCKeyCodeKeyO: number;

declare var GCKeyCodeKeyP: number;

declare var GCKeyCodeKeyQ: number;

declare var GCKeyCodeKeyR: number;

declare var GCKeyCodeKeyS: number;

declare var GCKeyCodeKeyT: number;

declare var GCKeyCodeKeyU: number;

declare var GCKeyCodeKeyV: number;

declare var GCKeyCodeKeyW: number;

declare var GCKeyCodeKeyX: number;

declare var GCKeyCodeKeyY: number;

declare var GCKeyCodeKeyZ: number;

declare var GCKeyCodeKeypad0: number;

declare var GCKeyCodeKeypad1: number;

declare var GCKeyCodeKeypad2: number;

declare var GCKeyCodeKeypad3: number;

declare var GCKeyCodeKeypad4: number;

declare var GCKeyCodeKeypad5: number;

declare var GCKeyCodeKeypad6: number;

declare var GCKeyCodeKeypad7: number;

declare var GCKeyCodeKeypad8: number;

declare var GCKeyCodeKeypad9: number;

declare var GCKeyCodeKeypadAsterisk: number;

declare var GCKeyCodeKeypadEnter: number;

declare var GCKeyCodeKeypadEqualSign: number;

declare var GCKeyCodeKeypadHyphen: number;

declare var GCKeyCodeKeypadNumLock: number;

declare var GCKeyCodeKeypadPeriod: number;

declare var GCKeyCodeKeypadPlus: number;

declare var GCKeyCodeKeypadSlash: number;

declare var GCKeyCodeLANG1: number;

declare var GCKeyCodeLANG2: number;

declare var GCKeyCodeLANG3: number;

declare var GCKeyCodeLANG4: number;

declare var GCKeyCodeLANG5: number;

declare var GCKeyCodeLANG6: number;

declare var GCKeyCodeLANG7: number;

declare var GCKeyCodeLANG8: number;

declare var GCKeyCodeLANG9: number;

declare var GCKeyCodeLeftAlt: number;

declare var GCKeyCodeLeftArrow: number;

declare var GCKeyCodeLeftControl: number;

declare var GCKeyCodeLeftGUI: number;

declare var GCKeyCodeLeftShift: number;

declare var GCKeyCodeNine: number;

declare var GCKeyCodeNonUSBackslash: number;

declare var GCKeyCodeNonUSPound: number;

declare var GCKeyCodeOne: number;

declare var GCKeyCodeOpenBracket: number;

declare var GCKeyCodePageDown: number;

declare var GCKeyCodePageUp: number;

declare var GCKeyCodePause: number;

declare var GCKeyCodePeriod: number;

declare var GCKeyCodePower: number;

declare var GCKeyCodePrintScreen: number;

declare var GCKeyCodeQuote: number;

declare var GCKeyCodeReturnOrEnter: number;

declare var GCKeyCodeRightAlt: number;

declare var GCKeyCodeRightArrow: number;

declare var GCKeyCodeRightControl: number;

declare var GCKeyCodeRightGUI: number;

declare var GCKeyCodeRightShift: number;

declare var GCKeyCodeScrollLock: number;

declare var GCKeyCodeSemicolon: number;

declare var GCKeyCodeSeven: number;

declare var GCKeyCodeSix: number;

declare var GCKeyCodeSlash: number;

declare var GCKeyCodeSpacebar: number;

declare var GCKeyCodeTab: number;

declare var GCKeyCodeThree: number;

declare var GCKeyCodeTwo: number;

declare var GCKeyCodeUpArrow: number;

declare var GCKeyCodeZero: number;

declare var GCKeyComma: string;

declare var GCKeyD: string;

declare var GCKeyDeleteForward: string;

declare var GCKeyDeleteOrBackspace: string;

declare var GCKeyDownArrow: string;

declare var GCKeyE: string;

declare var GCKeyEight: string;

declare var GCKeyEnd: string;

declare var GCKeyEqualSign: string;

declare var GCKeyEscape: string;

declare var GCKeyF: string;

declare var GCKeyF1: string;

declare var GCKeyF10: string;

declare var GCKeyF11: string;

declare var GCKeyF12: string;

declare var GCKeyF13: string;

declare var GCKeyF14: string;

declare var GCKeyF15: string;

declare var GCKeyF16: string;

declare var GCKeyF17: string;

declare var GCKeyF18: string;

declare var GCKeyF19: string;

declare var GCKeyF2: string;

declare var GCKeyF20: string;

declare var GCKeyF3: string;

declare var GCKeyF4: string;

declare var GCKeyF5: string;

declare var GCKeyF6: string;

declare var GCKeyF7: string;

declare var GCKeyF8: string;

declare var GCKeyF9: string;

declare var GCKeyFive: string;

declare var GCKeyFour: string;

declare var GCKeyG: string;

declare var GCKeyGraveAccentAndTilde: string;

declare var GCKeyH: string;

declare var GCKeyHome: string;

declare var GCKeyHyphen: string;

declare var GCKeyI: string;

declare var GCKeyInsert: string;

declare var GCKeyInternational1: string;

declare var GCKeyInternational2: string;

declare var GCKeyInternational3: string;

declare var GCKeyInternational4: string;

declare var GCKeyInternational5: string;

declare var GCKeyInternational6: string;

declare var GCKeyInternational7: string;

declare var GCKeyInternational8: string;

declare var GCKeyInternational9: string;

declare var GCKeyJ: string;

declare var GCKeyK: string;

declare var GCKeyKeypad0: string;

declare var GCKeyKeypad1: string;

declare var GCKeyKeypad2: string;

declare var GCKeyKeypad3: string;

declare var GCKeyKeypad4: string;

declare var GCKeyKeypad5: string;

declare var GCKeyKeypad6: string;

declare var GCKeyKeypad7: string;

declare var GCKeyKeypad8: string;

declare var GCKeyKeypad9: string;

declare var GCKeyKeypadAsterisk: string;

declare var GCKeyKeypadEnter: string;

declare var GCKeyKeypadEqualSign: string;

declare var GCKeyKeypadHyphen: string;

declare var GCKeyKeypadNumLock: string;

declare var GCKeyKeypadPeriod: string;

declare var GCKeyKeypadPlus: string;

declare var GCKeyKeypadSlash: string;

declare var GCKeyL: string;

declare var GCKeyLANG1: string;

declare var GCKeyLANG2: string;

declare var GCKeyLANG3: string;

declare var GCKeyLANG4: string;

declare var GCKeyLANG5: string;

declare var GCKeyLANG6: string;

declare var GCKeyLANG7: string;

declare var GCKeyLANG8: string;

declare var GCKeyLANG9: string;

declare var GCKeyLeftAlt: string;

declare var GCKeyLeftArrow: string;

declare var GCKeyLeftControl: string;

declare var GCKeyLeftGUI: string;

declare var GCKeyLeftShift: string;

declare var GCKeyM: string;

declare var GCKeyN: string;

declare var GCKeyNine: string;

declare var GCKeyNonUSBackslash: string;

declare var GCKeyNonUSPound: string;

declare var GCKeyO: string;

declare var GCKeyOne: string;

declare var GCKeyOpenBracket: string;

declare var GCKeyP: string;

declare var GCKeyPageDown: string;

declare var GCKeyPageUp: string;

declare var GCKeyPause: string;

declare var GCKeyPeriod: string;

declare var GCKeyPower: string;

declare var GCKeyPrintScreen: string;

declare var GCKeyQ: string;

declare var GCKeyQuote: string;

declare var GCKeyR: string;

declare var GCKeyReturnOrEnter: string;

declare var GCKeyRightAlt: string;

declare var GCKeyRightArrow: string;

declare var GCKeyRightControl: string;

declare var GCKeyRightGUI: string;

declare var GCKeyRightShift: string;

declare var GCKeyS: string;

declare var GCKeyScrollLock: string;

declare var GCKeySemicolon: string;

declare var GCKeySeven: string;

declare var GCKeySix: string;

declare var GCKeySlash: string;

declare var GCKeySpacebar: string;

declare var GCKeyT: string;

declare var GCKeyTab: string;

declare var GCKeyThree: string;

declare var GCKeyTwo: string;

declare var GCKeyU: string;

declare var GCKeyUpArrow: string;

declare var GCKeyV: string;

declare var GCKeyW: string;

declare var GCKeyX: string;

declare var GCKeyY: string;

declare var GCKeyZ: string;

declare var GCKeyZero: string;

declare class GCKeyboard extends NSObject implements GCDevice {

	static alloc(): GCKeyboard; // inherited from NSObject

	static new(): GCKeyboard; // inherited from NSObject

	readonly keyboardInput: GCKeyboardInput;

	static readonly coalescedKeyboard: GCKeyboard;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	handlerQueue: NSObject; // inherited from GCDevice

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly physicalInputProfile: GCPhysicalInputProfile; // inherited from GCDevice

	readonly productCategory: string; // inherited from GCDevice

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

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

declare var GCKeyboardDidConnectNotification: string;

declare var GCKeyboardDidDisconnectNotification: string;

declare class GCKeyboardInput extends GCPhysicalInputProfile {

	static alloc(): GCKeyboardInput; // inherited from NSObject

	static new(): GCKeyboardInput; // inherited from NSObject

	readonly anyKeyPressed: boolean;

	keyChangedHandler: (p1: GCKeyboardInput, p2: GCControllerButtonInput, p3: number, p4: boolean) => void;

	buttonForKeyCode(code: number): GCControllerButtonInput;
}

declare class GCMicroGamepad extends GCPhysicalInputProfile {

	static alloc(): GCMicroGamepad; // inherited from NSObject

	static new(): GCMicroGamepad; // inherited from NSObject

	allowsRotation: boolean;

	readonly buttonA: GCControllerButtonInput;

	readonly buttonMenu: GCControllerButtonInput;

	readonly buttonX: GCControllerButtonInput;

	readonly controller: GCController;

	readonly dpad: GCControllerDirectionPad;

	reportsAbsoluteDpadValues: boolean;

	valueChangedHandler: (p1: GCMicroGamepad, p2: GCControllerElement) => void;

	saveSnapshot(): GCMicroGamepadSnapshot;

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

declare function GCMicroGamepadSnapShotDataV100FromNSData(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapShotDataV100>, data: NSData): boolean;

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

declare function GCMicroGamepadSnapshotDataFromNSData(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapshotData>, data: NSData): boolean;

declare const enum GCMicroGamepadSnapshotDataVersion {

	Version1 = 256
}

declare class GCMotion extends NSObject {

	static alloc(): GCMotion; // inherited from NSObject

	static new(): GCMotion; // inherited from NSObject

	readonly acceleration: GCAcceleration;

	readonly attitude: GCQuaternion;

	readonly controller: GCController;

	readonly gravity: GCAcceleration;

	readonly hasAttitude: boolean;

	readonly hasAttitudeAndRotationRate: boolean;

	readonly hasGravityAndUserAcceleration: boolean;

	readonly hasRotationRate: boolean;

	readonly rotationRate: GCRotationRate;

	sensorsActive: boolean;

	readonly sensorsRequireManualActivation: boolean;

	readonly userAcceleration: GCAcceleration;

	valueChangedHandler: (p1: GCMotion) => void;

	setAcceleration(acceleration: GCAcceleration): void;

	setAttitude(attitude: GCQuaternion): void;

	setGravity(gravity: GCAcceleration): void;

	setRotationRate(rotationRate: GCRotationRate): void;

	setStateFromMotion(motion: GCMotion): void;

	setUserAcceleration(userAcceleration: GCAcceleration): void;
}

declare class GCMouse extends NSObject implements GCDevice {

	static alloc(): GCMouse; // inherited from NSObject

	static mice(): NSArray<GCMouse>;

	static new(): GCMouse; // inherited from NSObject

	readonly mouseInput: GCMouseInput;

	static readonly current: GCMouse;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	handlerQueue: NSObject; // inherited from GCDevice

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly physicalInputProfile: GCPhysicalInputProfile; // inherited from GCDevice

	readonly productCategory: string; // inherited from GCDevice

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

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

declare var GCMouseDidBecomeCurrentNotification: string;

declare var GCMouseDidConnectNotification: string;

declare var GCMouseDidDisconnectNotification: string;

declare var GCMouseDidStopBeingCurrentNotification: string;

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

declare class GCPhysicalInputProfile extends NSObject {

	static alloc(): GCPhysicalInputProfile; // inherited from NSObject

	static new(): GCPhysicalInputProfile; // inherited from NSObject

	readonly allAxes: NSSet<GCControllerAxisInput>;

	readonly allButtons: NSSet<GCControllerButtonInput>;

	readonly allDpads: NSSet<GCControllerDirectionPad>;

	readonly allElements: NSSet<GCControllerElement>;

	readonly allTouchpads: NSSet<GCControllerTouchpad>;

	readonly axes: NSDictionary<string, GCControllerAxisInput>;

	readonly buttons: NSDictionary<string, GCControllerButtonInput>;

	readonly device: GCDevice;

	readonly dpads: NSDictionary<string, GCControllerDirectionPad>;

	readonly elements: NSDictionary<string, GCControllerElement>;

	readonly hasRemappedElements: boolean;

	readonly lastEventTimestamp: number;

	readonly touchpads: NSDictionary<string, GCControllerTouchpad>;

	capture(): this;

	mappedElementAliasForPhysicalInputName(inputName: string): string;

	mappedPhysicalInputNamesForElementAlias(elementAlias: string): NSSet<string>;

	objectForKeyedSubscript(key: string): GCControllerElement;

	setStateFromPhysicalInput(physicalInput: GCPhysicalInputProfile): void;
}

declare var GCProductCategoryCoalescedRemote: string;

declare var GCProductCategoryControlCenterRemote: string;

declare var GCProductCategoryDualSense: string;

declare var GCProductCategoryDualShock4: string;

declare var GCProductCategoryKeyboard: string;

declare var GCProductCategoryMFi: string;

declare var GCProductCategoryMouse: string;

declare var GCProductCategorySiriRemote1stGen: string;

declare var GCProductCategorySiriRemote2ndGen: string;

declare var GCProductCategoryUniversalElectronicsRemote: string;

declare var GCProductCategoryXboxOne: string;

interface GCQuaternion {
	x: number;
	y: number;
	z: number;
	w: number;
}
declare var GCQuaternion: interop.StructType<GCQuaternion>;

interface GCRotationRate {
	x: number;
	y: number;
	z: number;
}
declare var GCRotationRate: interop.StructType<GCRotationRate>;

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

declare class GCVirtualController extends NSObject {

	static alloc(): GCVirtualController; // inherited from NSObject

	static new(): GCVirtualController; // inherited from NSObject

	static virtualControllerWithConfiguration(configuration: GCVirtualControllerConfiguration): GCVirtualController;

	readonly controller: GCController;

	constructor(o: { configuration: GCVirtualControllerConfiguration; });

	connectWithReplyHandler(reply: (p1: NSError) => void): void;

	disconnect(): void;

	initWithConfiguration(configuration: GCVirtualControllerConfiguration): this;

	updateConfigurationForElementConfiguration(element: string, config: (p1: GCVirtualControllerElementConfiguration) => GCVirtualControllerElementConfiguration): void;
}

declare class GCVirtualControllerConfiguration extends NSObject {

	static alloc(): GCVirtualControllerConfiguration; // inherited from NSObject

	static new(): GCVirtualControllerConfiguration; // inherited from NSObject

	elements: NSSet<string>;
}

declare class GCVirtualControllerElementConfiguration extends NSObject {

	static alloc(): GCVirtualControllerElementConfiguration; // inherited from NSObject

	static new(): GCVirtualControllerElementConfiguration; // inherited from NSObject

	actsAsTouchpad: boolean;

	hidden: boolean;

	path: UIBezierPath;
}

declare class GCXboxGamepad extends GCExtendedGamepad {

	static alloc(): GCXboxGamepad; // inherited from NSObject

	static new(): GCXboxGamepad; // inherited from NSObject

	readonly buttonShare: GCControllerButtonInput;

	readonly paddleButton1: GCControllerButtonInput;

	readonly paddleButton2: GCControllerButtonInput;

	readonly paddleButton3: GCControllerButtonInput;

	readonly paddleButton4: GCControllerButtonInput;
}

declare function NSDataFromGCExtendedGamepadSnapShotDataV100(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapShotDataV100>): NSData;

declare function NSDataFromGCExtendedGamepadSnapshotData(snapshotData: interop.Pointer | interop.Reference<GCExtendedGamepadSnapshotData>): NSData;

declare function NSDataFromGCGamepadSnapShotDataV100(snapshotData: interop.Pointer | interop.Reference<GCGamepadSnapShotDataV100>): NSData;

declare function NSDataFromGCMicroGamepadSnapShotDataV100(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapShotDataV100>): NSData;

declare function NSDataFromGCMicroGamepadSnapshotData(snapshotData: interop.Pointer | interop.Reference<GCMicroGamepadSnapshotData>): NSData;
