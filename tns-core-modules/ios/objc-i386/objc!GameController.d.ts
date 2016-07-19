
interface GCAcceleration {
	x: number;
	y: number;
	z: number;
}
declare var GCAcceleration: interop.StructType<GCAcceleration>;

declare class GCController extends NSObject {

	static alloc(): GCController; // inherited from NSObject

	static controllers(): NSArray<GCController>;

	static new(): GCController; // inherited from NSObject

	static startWirelessControllerDiscoveryWithCompletionHandler(completionHandler: () => void): void;

	static stopWirelessControllerDiscovery(): void;

	/* readonly */ attachedToDevice: boolean;

	controllerPausedHandler: (p1: GCController) => void;

	/* readonly */ extendedGamepad: GCExtendedGamepad;

	/* readonly */ gamepad: GCGamepad;

	handlerQueue: NSObject;

	/* readonly */ motion: GCMotion;

	playerIndex: GCControllerPlayerIndex;

	/* readonly */ vendorName: string;

	constructor(); // inherited from NSObject

	self(): GCController; // inherited from NSObjectProtocol
}

declare class GCControllerAxisInput extends GCControllerElement {

	/* readonly */ value: number;

	valueChangedHandler: (p1: GCControllerAxisInput, p2: number) => void;
}

declare class GCControllerButtonInput extends GCControllerElement {

	/* readonly */ pressed: boolean;

	pressedChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean) => void;

	/* readonly */ value: number;

	valueChangedHandler: (p1: GCControllerButtonInput, p2: number, p3: boolean) => void;
}

declare var GCControllerDidConnectNotification: string;

declare var GCControllerDidDisconnectNotification: string;

declare class GCControllerDirectionPad extends GCControllerElement {

	/* readonly */ down: GCControllerButtonInput;

	/* readonly */ left: GCControllerButtonInput;

	/* readonly */ right: GCControllerButtonInput;

	/* readonly */ up: GCControllerButtonInput;

	valueChangedHandler: (p1: GCControllerDirectionPad, p2: number, p3: number) => void;

	/* readonly */ xAxis: GCControllerAxisInput;

	/* readonly */ yAxis: GCControllerAxisInput;
}

declare class GCControllerElement extends NSObject {

	static alloc(): GCControllerElement; // inherited from NSObject

	static new(): GCControllerElement; // inherited from NSObject

	/* readonly */ analog: boolean;

	/* readonly */ collection: GCControllerElement;

	constructor(); // inherited from NSObject

	self(): GCControllerElement; // inherited from NSObjectProtocol
}

declare const enum GCControllerPlayerIndex {

	IndexUnset = -1,

	Index1 = 0,

	Index2 = 1,

	Index3 = 2,

	Index4 = 3
}

interface GCEulerAngles {
	pitch: number;
	yaw: number;
	roll: number;
}
declare var GCEulerAngles: interop.StructType<GCEulerAngles>;

declare class GCExtendedGamepad extends NSObject {

	static alloc(): GCExtendedGamepad; // inherited from NSObject

	static new(): GCExtendedGamepad; // inherited from NSObject

	/* readonly */ buttonA: GCControllerButtonInput;

	/* readonly */ buttonB: GCControllerButtonInput;

	/* readonly */ buttonX: GCControllerButtonInput;

	/* readonly */ buttonY: GCControllerButtonInput;

	/* readonly */ controller: GCController;

	/* readonly */ dpad: GCControllerDirectionPad;

	/* readonly */ leftShoulder: GCControllerButtonInput;

	/* readonly */ leftThumbstick: GCControllerDirectionPad;

	/* readonly */ leftTrigger: GCControllerButtonInput;

	/* readonly */ rightShoulder: GCControllerButtonInput;

	/* readonly */ rightThumbstick: GCControllerDirectionPad;

	/* readonly */ rightTrigger: GCControllerButtonInput;

	valueChangedHandler: (p1: GCExtendedGamepad, p2: GCControllerElement) => void;

	constructor(); // inherited from NSObject

	saveSnapshot(): GCExtendedGamepadSnapshot;

	self(): GCExtendedGamepad; // inherited from NSObjectProtocol
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

declare function GCExtendedGamepadSnapShotDataV100FromNSData(snapshotData: interop.Reference<GCExtendedGamepadSnapShotDataV100>, data: NSData): boolean;

declare class GCExtendedGamepadSnapshot extends GCExtendedGamepad {

	snapshotData: NSData;

	constructor(o: { controller: GCController; snapshotData: NSData; });

	constructor(o: { snapshotData: NSData; });
}

declare class GCGamepad extends NSObject {

	static alloc(): GCGamepad; // inherited from NSObject

	static new(): GCGamepad; // inherited from NSObject

	/* readonly */ buttonA: GCControllerButtonInput;

	/* readonly */ buttonB: GCControllerButtonInput;

	/* readonly */ buttonX: GCControllerButtonInput;

	/* readonly */ buttonY: GCControllerButtonInput;

	/* readonly */ controller: GCController;

	/* readonly */ dpad: GCControllerDirectionPad;

	/* readonly */ leftShoulder: GCControllerButtonInput;

	/* readonly */ rightShoulder: GCControllerButtonInput;

	valueChangedHandler: (p1: GCGamepad, p2: GCControllerElement) => void;

	constructor(); // inherited from NSObject

	saveSnapshot(): GCGamepadSnapshot;

	self(): GCGamepad; // inherited from NSObjectProtocol
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

declare function GCGamepadSnapShotDataV100FromNSData(snapshotData: interop.Reference<GCGamepadSnapShotDataV100>, data: NSData): boolean;

declare class GCGamepadSnapshot extends GCGamepad {

	snapshotData: NSData;

	constructor(o: { controller: GCController; snapshotData: NSData; });

	constructor(o: { snapshotData: NSData; });
}

declare class GCMotion extends NSObject {

	static alloc(): GCMotion; // inherited from NSObject

	static new(): GCMotion; // inherited from NSObject

	/* readonly */ attitude: GCQuaternion;

	/* readonly */ controller: GCController;

	/* readonly */ gravity: GCAcceleration;

	/* readonly */ rotationRate: GCRotationRate;

	/* readonly */ userAcceleration: GCAcceleration;

	valueChangedHandler: (p1: GCMotion) => void;

	constructor(); // inherited from NSObject

	self(): GCMotion; // inherited from NSObjectProtocol
}

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

declare function NSDataFromGCExtendedGamepadSnapShotDataV100(snapshotData: interop.Reference<GCExtendedGamepadSnapShotDataV100>): NSData;

declare function NSDataFromGCGamepadSnapShotDataV100(snapshotData: interop.Reference<GCGamepadSnapShotDataV100>): NSData;
