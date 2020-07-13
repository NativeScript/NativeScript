declare var __registerDomainDispatcher;
declare var __inspectorSendEvent;
export function DomainDispatcher(domain: string): ClassDecorator {
	return (klass) => __registerDomainDispatcher(domain, klass);
}
// Heap
// Heap domain exposes JavaScript heap attributes and capabilities.
export namespace HeapDomain {
	// JavaScriptCore HeapSnapshot JSON data.
	export type HeapSnapshotData = string;

	export interface GarbageCollection {
		// The type of garbage collection.
		type: any /* full,partial */;
		startTime: number;
		endTime: number;
	}

	export interface GetPreviewMethodArguments {
		// Identifier of the heap object within the snapshot.
		heapObjectId: number;
	}
	export interface GetRemoteObjectMethodArguments {
		// Identifier of the heap object within the snapshot.
		heapObjectId: number;
		// Symbolic group name that can be used to release multiple objects.
		objectGroup?: string;
	}
	export interface HeapDomainDispatcher {
		// Enables Heap domain events.
		enable(): void;
		// Disables Heap domain events.
		disable(): void;
		// Trigger a full garbage collection.
		gc(): void;
		// Take a heap snapshot.
		snapshot(): { timestamp: number; snapshotData: HeapSnapshotData };
		// Start tracking heap changes. This will produce a `trackingStart` event.
		startTracking(): void;
		// Stop tracking heap changes. This will produce a `trackingComplete` event.
		stopTracking(): void;
		// Returns a preview (string, Debugger.FunctionDetails, or Runtime.ObjectPreview) for a Heap.HeapObjectId.
		getPreview(
			params: GetPreviewMethodArguments
		): {
			string?: string;
			functionDetails?: DebuggerDomain.FunctionDetails;
			preview?: RuntimeDomain.ObjectPreview;
		};
		// Returns the strongly referenced Runtime.RemoteObject for a Heap.HeapObjectId.
		getRemoteObject(params: GetRemoteObjectMethodArguments): { result: RuntimeDomain.RemoteObject };
	}
	export class HeapFrontend {
		// Information about the garbage collection.
		garbageCollected(collection: GarbageCollection): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Heap.garbageCollected',
					params: { collection: collection },
				})
			);
		}
		// Tracking started.
		trackingStart(timestamp: number, snapshotData: HeapSnapshotData): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Heap.trackingStart',
					params: {
						timestamp: timestamp,
						snapshotData: snapshotData,
					},
				})
			);
		}
		// Tracking stopped.
		trackingComplete(timestamp: number, snapshotData: HeapSnapshotData): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Heap.trackingComplete',
					params: {
						timestamp: timestamp,
						snapshotData: snapshotData,
					},
				})
			);
		}
	}
}

// Debugger
// Debugger domain exposes JavaScript debugging capabilities. It allows setting and removing breakpoints, stepping through execution, exploring stack traces, etc.
export namespace DebuggerDomain {
	// Breakpoint identifier.
	export type BreakpointId = string;
	// Breakpoint action identifier.
	export type BreakpointActionIdentifier = number;
	// Unique script identifier.
	export type ScriptId = string;
	// Call frame identifier.
	export type CallFrameId = string;

	export interface Location {
		// Script identifier as reported in the <code>Debugger.scriptParsed</code>.
		scriptId: ScriptId;
		// Line number in the script.
		lineNumber: number;
		// Column number in the script.
		columnNumber?: number;
	}

	export interface BreakpointAction {
		// Different kinds of breakpoint actions.
		type: any /* log,evaluate,sound,probe */;
		// Data associated with this breakpoint type (e.g. for type "eval" this is the JavaScript string to evalulate).
		data?: string;
		// A frontend-assigned identifier for this breakpoint action.
		id?: BreakpointActionIdentifier;
	}

	export interface BreakpointOptions {
		// Expression to use as a breakpoint condition. When specified, debugger will only stop on the breakpoint if this expression evaluates to true.
		condition?: string;
		// Actions to perform automatically when the breakpoint is triggered.
		actions?: BreakpointAction[];
		// Automatically continue after hitting this breakpoint and running actions.
		autoContinue?: boolean;
		// Number of times to ignore this breakpoint, before stopping on the breakpoint and running actions.
		ignoreCount?: number;
	}

	export interface FunctionDetails {
		// Location of the function.
		location: Location;
		// Name of the function. Not present for anonymous functions.
		name?: string;
		// Display name of the function(specified in 'displayName' property on the function object).
		displayName?: string;
		// Scope chain for this closure.
		scopeChain?: Scope[];
	}

	export interface CallFrame {
		// Call frame identifier. This identifier is only valid while the virtual machine is paused.
		callFrameId: CallFrameId;
		// Name of the JavaScript function called on this call frame.
		functionName: string;
		// Location in the source code.
		location: Location;
		// Scope chain for this call frame.
		scopeChain: Scope[];
		// <code>this</code> object for this call frame.
		this: RuntimeDomain.RemoteObject;
		// Is the current frame tail deleted from a tail call.
		isTailDeleted: boolean;
	}

	export interface Scope {
		// Object representing the scope. For <code>global</code> and <code>with</code> scopes it represents the actual object; for the rest of the scopes, it is artificial transient object enumerating scope variables as its properties.
		object: RuntimeDomain.RemoteObject;
		// Scope type.
		type: any /* global,with,closure,catch,functionName,globalLexicalEnvironment,nestedLexical */;
		// Name associated with the scope.
		name?: string;
		// Location if available of the scope definition.
		location?: Location;
		// Whether the scope has any variables.
		empty?: boolean;
	}

	export interface ProbeSample {
		// Identifier of the probe breakpoint action that created the sample.
		probeId: BreakpointActionIdentifier;
		// Unique identifier for this sample.
		sampleId: number;
		// A batch identifier which is the same for all samples taken at the same breakpoint hit.
		batchId: number;
		// Timestamp of when the sample was taken.
		timestamp: number;
		// Contents of the sample.
		payload: RuntimeDomain.RemoteObject;
	}

	export interface AssertPauseReason {
		// The console.assert message string if provided.
		message?: string;
	}

	export interface BreakpointPauseReason {
		// The identifier of the breakpoint causing the pause.
		breakpointId: string;
	}

	export interface CSPViolationPauseReason {
		// The CSP directive that blocked script execution.
		directive: string;
	}

	export interface SetBreakpointsActiveMethodArguments {
		// New value for breakpoints active state.
		active: boolean;
	}
	export interface SetBreakpointByUrlMethodArguments {
		// Line number to set breakpoint at.
		lineNumber: number;
		// URL of the resources to set breakpoint on.
		url?: string;
		// Regex pattern for the URLs of the resources to set breakpoints on. Either <code>url</code> or <code>urlRegex</code> must be specified.
		urlRegex?: string;
		// Offset in the line to set breakpoint at.
		columnNumber?: number;
		// Options to apply to this breakpoint to modify its behavior.
		options?: BreakpointOptions;
	}
	export interface SetBreakpointMethodArguments {
		// Location to set breakpoint in.
		location: Location;
		// Options to apply to this breakpoint to modify its behavior.
		options?: BreakpointOptions;
	}
	export interface RemoveBreakpointMethodArguments {
		breakpointId: BreakpointId;
	}
	export interface ContinueToLocationMethodArguments {
		// Location to continue to.
		location: Location;
	}
	export interface SearchInContentMethodArguments {
		// Id of the script to search in.
		scriptId: ScriptId;
		// String to search for.
		query: string;
		// If true, search is case sensitive.
		caseSensitive?: boolean;
		// If true, treats string parameter as regex.
		isRegex?: boolean;
	}
	export interface GetScriptSourceMethodArguments {
		// Id of the script to get source for.
		scriptId: ScriptId;
	}
	export interface SetScriptSourceMethodArguments {
		// Absolute location of the script to set source for.
		scriptUrl: string;
		// Script source.
		scriptSource: string;
	}
	export interface GetFunctionDetailsMethodArguments {
		// Id of the function to get location for.
		functionId: RuntimeDomain.RemoteObjectId;
	}
	export interface SetPauseOnExceptionsMethodArguments {
		// Pause on exceptions mode.
		state: any /* none,uncaught,all */;
	}
	export interface SetPauseOnAssertionsMethodArguments {
		enabled: boolean;
	}
	export interface EvaluateOnCallFrameMethodArguments {
		// Call frame identifier to evaluate on.
		callFrameId: CallFrameId;
		// Expression to evaluate.
		expression: string;
		// String object group name to put result into (allows rapid releasing resulting object handles using <code>releaseObjectGroup</code>).
		objectGroup?: string;
		// Specifies whether command line API should be available to the evaluated expression, defaults to false.
		includeCommandLineAPI?: boolean;
		// Specifies whether evaluation should stop on exceptions and mute console. Overrides setPauseOnException state.
		doNotPauseOnExceptionsAndMuteConsole?: boolean;
		// Whether the result is expected to be a JSON object that should be sent by value.
		returnByValue?: boolean;
		// Whether preview should be generated for the result.
		generatePreview?: boolean;
		// Whether the resulting value should be considered for saving in the $n history.
		saveResult?: boolean;
	}
	export interface SetOverlayMessageMethodArguments {
		// Overlay message to display when paused in debugger.
		message?: string;
	}
	export interface DebuggerDomainDispatcher {
		// Enables debugger for the given page. Clients should not assume that the debugging has been enabled until the result for this command is received.
		enable(): void;
		// Disables debugger for given page.
		disable(): void;
		// Activates / deactivates all breakpoints on the page.
		setBreakpointsActive(params: SetBreakpointsActiveMethodArguments): void;
		// Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this command is issued, all existing parsed scripts will have breakpoints resolved and returned in <code>locations</code> property. Further matching script parsing will result in subsequent <code>breakpointResolved</code> events issued. This logical breakpoint will survive page reloads.
		setBreakpointByUrl(params: SetBreakpointByUrlMethodArguments): { breakpointId: BreakpointId; locations: Location[] };
		// Sets JavaScript breakpoint at a given location.
		setBreakpoint(params: SetBreakpointMethodArguments): { breakpointId: BreakpointId; actualLocation: Location };
		// Removes JavaScript breakpoint.
		removeBreakpoint(params: RemoveBreakpointMethodArguments): void;
		// Continues execution until specific location is reached.
		continueToLocation(params: ContinueToLocationMethodArguments): void;
		// Steps over the statement.
		stepOver(): void;
		// Steps into the function call.
		stepInto(): void;
		// Steps out of the function call.
		stepOut(): void;
		// Stops on the next JavaScript statement.
		pause(): void;
		// Resumes JavaScript execution.
		resume(): void;
		// Searches for given string in script content.
		searchInContent(params: SearchInContentMethodArguments): { result: GenericTypesDomain.SearchMatch[] };
		// Returns source for the script with given id.
		getScriptSource(params: GetScriptSourceMethodArguments): { scriptSource: string };
		// Set source for the script with given id.
		setScriptSource(params: SetScriptSourceMethodArguments): void;
		// Returns detailed information on given function.
		getFunctionDetails(params: GetFunctionDetailsMethodArguments): { details: FunctionDetails };
		// Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or no exceptions. Initial pause on exceptions state is <code>none</code>.
		setPauseOnExceptions(params: SetPauseOnExceptionsMethodArguments): void;
		// Set pause on assertions state. Assertions are console.assert assertions.
		setPauseOnAssertions(params: SetPauseOnAssertionsMethodArguments): void;
		// Evaluates expression on a given call frame.
		evaluateOnCallFrame(
			params: EvaluateOnCallFrameMethodArguments
		): {
			result: RuntimeDomain.RemoteObject;
			wasThrown?: boolean;
			savedResultIndex?: number;
		};
		// Sets overlay message.
		setOverlayMessage(params: SetOverlayMessageMethodArguments): void;
	}
	export class DebuggerFrontend {
		// Called when global has been cleared and debugger client should reset its state. Happens upon navigation or reload.
		globalObjectCleared(): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Debugger.globalObjectCleared',
					params: {},
				})
			);
		}
		// Fired when virtual machine parses script. This event is also fired for all known and uncollected scripts upon enabling debugger.
		scriptParsed(scriptId: ScriptId, url: string, startLine: number, startColumn: number, endLine: number, endColumn: number, isContentScript?: boolean, sourceURL?: string, sourceMapURL?: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Debugger.scriptParsed',
					params: {
						scriptId: scriptId,
						url: url,
						startLine: startLine,
						startColumn: startColumn,
						endLine: endLine,
						endColumn: endColumn,
						isContentScript: isContentScript,
						sourceURL: sourceURL,
						sourceMapURL: sourceMapURL,
					},
				})
			);
		}
		// Fired when virtual machine fails to parse the script.
		scriptFailedToParse(url: string, scriptSource: string, startLine: number, errorLine: number, errorMessage: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Debugger.scriptFailedToParse',
					params: {
						url: url,
						scriptSource: scriptSource,
						startLine: startLine,
						errorLine: errorLine,
						errorMessage: errorMessage,
					},
				})
			);
		}
		// Fired when breakpoint is resolved to an actual script and location.
		breakpointResolved(breakpointId: BreakpointId, location: Location): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Debugger.breakpointResolved',
					params: { breakpointId: breakpointId, location: location },
				})
			);
		}
		// Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.
		paused(callFrames: CallFrame[], reason: any /* XHR,DOM,EventListener,exception,assert,CSPViolation,DebuggerStatement,Breakpoint,PauseOnNextStatement,other */, data?: Object): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Debugger.paused',
					params: {
						callFrames: callFrames,
						reason: reason,
						data: data,
					},
				})
			);
		}
		// Fired when the virtual machine resumed execution.
		resumed(): void {
			__inspectorSendEvent(JSON.stringify({ method: 'Debugger.resumed', params: {} }));
		}
		// Fires when a new probe sample is collected.
		didSampleProbe(sample: ProbeSample): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Debugger.didSampleProbe',
					params: { sample: sample },
				})
			);
		}
		// Fired when a "sound" breakpoint action is triggered on a breakpoint.
		playBreakpointActionSound(breakpointActionId: BreakpointActionIdentifier): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Debugger.playBreakpointActionSound',
					params: { breakpointActionId: breakpointActionId },
				})
			);
		}
	}
}

// Runtime
// Runtime domain exposes JavaScript runtime by means of remote evaluation and mirror objects. Evaluation results are returned as mirror object that expose object type, string representation and unique identifier that can be used for further object reference. Original objects are maintained in memory unless they are either explicitly released or are released along with the other objects in their object group.
export namespace RuntimeDomain {
	// Unique object identifier.
	export type RemoteObjectId = string;
	// Id of an execution context.
	export type ExecutionContextId = number;

	export interface RemoteObject {
		// Object type.
		type: any /* object,function,undefined,string,number,boolean,symbol */;
		// Object subtype hint. Specified for <code>object</code> <code>function</code> (for class) type values only.
		subtype?: any /* array,null,node,regexp,date,error,map,set,weakmap,weakset,iterator,class,proxy */;
		// Object class (constructor) name. Specified for <code>object</code> type values only.
		className?: string;
		// Remote object value (in case of primitive values or JSON values if it was requested).
		value?: any;
		// String representation of the object.
		description?: string;
		// Unique object identifier (for non-primitive values).
		objectId?: RemoteObjectId;
		// Size of the array/collection. Specified for array/map/set/weakmap/weakset object type values only.
		size?: number;
		// Remote object for the class prototype. Specified for class object type values only.
		classPrototype?: RemoteObject;
		// Preview containing abbreviated property values. Specified for <code>object</code> type values only.
		preview?: ObjectPreview;
	}

	export interface ObjectPreview {
		// Object type.
		type: any /* object,function,undefined,string,number,boolean,symbol */;
		// Object subtype hint. Specified for <code>object</code> type values only.
		subtype?: any /* array,null,node,regexp,date,error,map,set,weakmap,weakset,iterator,class,proxy */;
		// String representation of the object.
		description?: string;
		// Determines whether preview is lossless (contains all information of the original object).
		lossless: boolean;
		// True iff some of the properties of the original did not fit.
		overflow?: boolean;
		// List of the properties.
		properties?: PropertyPreview[];
		// List of the entries. Specified for <code>map</code> and <code>set</code> subtype values only.
		entries?: EntryPreview[];
		// Size of the array/collection. Specified for array/map/set/weakmap/weakset object type values only.
		size?: number;
	}

	export interface PropertyPreview {
		// Property name.
		name: string;
		// Object type.
		type: any /* object,function,undefined,string,number,boolean,symbol,accessor */;
		// Object subtype hint. Specified for <code>object</code> type values only.
		subtype?: any /* array,null,node,regexp,date,error,map,set,weakmap,weakset,iterator,class,proxy */;
		// User-friendly property value string.
		value?: string;
		// Nested value preview.
		valuePreview?: ObjectPreview;
		// True if this is an internal property.
		internal?: boolean;
	}

	export interface EntryPreview {
		// Entry key. Specified for map-like collection entries.
		key?: ObjectPreview;
		// Entry value.
		value: ObjectPreview;
	}

	export interface CollectionEntry {
		// Entry key of a map-like collection, otherwise not provided.
		key?: RemoteObject;
		// Entry value.
		value: RemoteObject;
	}

	export interface PropertyDescriptor {
		// Property name or symbol description.
		name: string;
		// The value associated with the property.
		value?: RemoteObject;
		// True if the value associated with the property may be changed (data descriptors only).
		writable?: boolean;
		// A function which serves as a getter for the property, or <code>undefined</code> if there is no getter (accessor descriptors only).
		get?: RemoteObject;
		// A function which serves as a setter for the property, or <code>undefined</code> if there is no setter (accessor descriptors only).
		set?: RemoteObject;
		// True if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object.
		configurable: boolean;
		// True if this property shows up during enumeration of the properties on the corresponding object.
		enumerable: boolean;
		// True if the result was thrown during the evaluation.
		wasThrown?: boolean;
		// True if the property is owned for the object.
		isOwn?: boolean;
		// Property symbol object, if the property is a symbol.
		symbol?: RemoteObject;
		// True if the property value came from a native getter.
		nativeGetter?: boolean;
	}

	export interface InternalPropertyDescriptor {
		// Conventional property name.
		name: string;
		// The value associated with the property.
		value?: RemoteObject;
	}

	export interface CallArgument {
		// Primitive value.
		value?: any;
		// Remote object handle.
		objectId?: RemoteObjectId;
	}

	export interface ExecutionContextDescription {
		// Unique id of the execution context. It can be used to specify in which execution context script evaluation should be performed.
		id: ExecutionContextId;
		// True if this is a context where inpspected web page scripts run. False if it is a content script isolated context.
		isPageContext: boolean;
		// Human readable name describing given context.
		name: string;
		// Id of the owning frame.
		frameId: NetworkDomain.FrameId;
	}

	export interface ErrorRange {
		// Start offset of range (inclusive).
		startOffset: number;
		// End offset of range (exclusive).
		endOffset: number;
	}

	export interface StructureDescription {
		// Array of strings, where the strings represent object properties.
		fields?: string[];
		// Array of strings, where the strings represent optional object properties.
		optionalFields?: string[];
		// Name of the constructor.
		constructorName?: string;
		// Pointer to the StructureRepresentation of the protoype if one exists.
		prototypeStructure?: StructureDescription;
		// If true, it indicates that the fields in this StructureDescription may be inaccurate. I.e, there might have been fields that have been deleted before it was profiled or it has fields we haven't profiled.
		isImprecise?: boolean;
	}

	export interface TypeSet {
		// Indicates if this type description has been type Function.
		isFunction: boolean;
		// Indicates if this type description has been type Undefined.
		isUndefined: boolean;
		// Indicates if this type description has been type Null.
		isNull: boolean;
		// Indicates if this type description has been type Boolean.
		isBoolean: boolean;
		// Indicates if this type description has been type Integer.
		isInteger: boolean;
		// Indicates if this type description has been type Number.
		isNumber: boolean;
		// Indicates if this type description has been type String.
		isString: boolean;
		// Indicates if this type description has been type Object.
		isObject: boolean;
		// Indicates if this type description has been type Symbol.
		isSymbol: boolean;
	}

	export interface TypeDescription {
		// If true, we were able to correlate the offset successfuly with a program location. If false, the offset may be bogus or the offset may be from a CodeBlock that hasn't executed.
		isValid: boolean;
		// Least common ancestor of all Constructors if the TypeDescription has seen any structures. This string is the display name of the shared constructor function.
		leastCommonAncestor?: string;
		// Set of booleans for determining the aggregate type of this type description.
		typeSet?: TypeSet;
		// Array of descriptions for all structures seen for this variable.
		structures?: StructureDescription[];
		// If true, this indicates that no more structures are being profiled because some maximum threshold has been reached and profiling has stopped because of memory pressure.
		isTruncated?: boolean;
	}

	export interface TypeLocation {
		// What kind of type information do we want (normal, function return values, 'this' statement).
		typeInformationDescriptor: number;
		// sourceID uniquely identifying a script
		sourceID: string;
		// character offset for assignment range
		divot: number;
	}

	export interface BasicBlock {
		// Start offset of the basic block.
		startOffset: number;
		// End offset of the basic block.
		endOffset: number;
		// Indicates if the basic block has executed before.
		hasExecuted: boolean;
		// Indicates how many times the basic block has executed.
		executionCount: number;
	}

	export const enum SyntaxErrorType {
		None,
		Irrecoverable,
		UnterminatedLiteral,
		Recoverable,
	}

	export interface ParseMethodArguments {
		// Source code to parse.
		source: string;
	}
	export interface EvaluateMethodArguments {
		// Expression to evaluate.
		expression: string;
		// Symbolic group name that can be used to release multiple objects.
		objectGroup?: string;
		// Determines whether Command Line API should be available during the evaluation.
		includeCommandLineAPI?: boolean;
		// Specifies whether evaluation should stop on exceptions and mute console. Overrides setPauseOnException state.
		doNotPauseOnExceptionsAndMuteConsole?: boolean;
		// Specifies in which isolated context to perform evaluation. Each content script lives in an isolated context and this parameter may be used to specify one of those contexts. If the parameter is omitted or 0 the evaluation will be performed in the context of the inspected page.
		contextId?: ExecutionContextId;
		// Whether the result is expected to be a JSON object that should be sent by value.
		returnByValue?: boolean;
		// Whether preview should be generated for the result.
		generatePreview?: boolean;
		// Whether the resulting value should be considered for saving in the $n history.
		saveResult?: boolean;
	}
	export interface CallFunctionOnMethodArguments {
		// Identifier of the object to call function on.
		objectId: RemoteObjectId;
		// Declaration of the function to call.
		functionDeclaration: string;
		// Call arguments. All call arguments must belong to the same JavaScript world as the target object.
		arguments?: CallArgument[];
		// Specifies whether function call should stop on exceptions and mute console. Overrides setPauseOnException state.
		doNotPauseOnExceptionsAndMuteConsole?: boolean;
		// Whether the result is expected to be a JSON object which should be sent by value.
		returnByValue?: boolean;
		// Whether preview should be generated for the result.
		generatePreview?: boolean;
	}
	export interface GetPropertiesMethodArguments {
		// Identifier of the object to return properties for.
		objectId: RemoteObjectId;
		// If true, returns properties belonging only to the object itself, not to its prototype chain.
		ownProperties?: boolean;
		// Whether preview should be generated for property values.
		generatePreview?: boolean;
	}
	export interface GetDisplayablePropertiesMethodArguments {
		// Identifier of the object to return properties for.
		objectId: RemoteObjectId;
		// Whether preview should be generated for property values.
		generatePreview?: boolean;
	}
	export interface GetCollectionEntriesMethodArguments {
		// Id of the collection to get entries for.
		objectId: RemoteObjectId;
		// Symbolic group name that can be used to release multiple. If not provided, it will be the same objectGroup as the RemoteObject determined from <code>objectId</code>. This is useful for WeakMap to release the collection entries.
		objectGroup?: string;
		// If provided skip to this index before collecting values. Otherwise, 0.
		startIndex?: number;
		// If provided only return <code>numberToFetch</code> values. Otherwise, return values all the way to the end.
		numberToFetch?: number;
	}
	export interface SaveResultMethodArguments {
		// Id or value of the object to save.
		value: CallArgument;
		// Unique id of the execution context. To specify in which execution context script evaluation should be performed. If not provided, determine from the CallArgument's objectId.
		contextId?: ExecutionContextId;
	}
	export interface ReleaseObjectMethodArguments {
		// Identifier of the object to release.
		objectId: RemoteObjectId;
	}
	export interface ReleaseObjectGroupMethodArguments {
		// Symbolic object group name.
		objectGroup: string;
	}
	export interface GetRuntimeTypesForVariablesAtOffsetsMethodArguments {
		// An array of type locations we're requesting information for. Results are expected in the same order they're sent in.
		locations: TypeLocation[];
	}
	export interface GetBasicBlocksMethodArguments {
		// Indicates which sourceID information is requested for.
		sourceID: string;
	}
	export interface RuntimeDomainDispatcher {
		// Parses JavaScript source code for errors.
		parse(params: ParseMethodArguments): { result: SyntaxErrorType; message?: string; range?: ErrorRange };
		// Evaluates expression on global object.
		evaluate(
			params: EvaluateMethodArguments
		): {
			result: RemoteObject;
			wasThrown?: boolean;
			savedResultIndex?: number;
		};
		// Calls function with given declaration on the given object. Object group of the result is inherited from the target object.
		callFunctionOn(params: CallFunctionOnMethodArguments): { result: RemoteObject; wasThrown?: boolean };
		// Returns properties of a given object. Object group of the result is inherited from the target object.
		getProperties(
			params: GetPropertiesMethodArguments
		): {
			result: PropertyDescriptor[];
			internalProperties?: InternalPropertyDescriptor[];
		};
		// Returns displayable properties of a given object. Object group of the result is inherited from the target object. Displayable properties are own properties, internal properties, and native getters in the prototype chain (assumed to be bindings and treated like own properties for the frontend).
		getDisplayableProperties(
			params: GetDisplayablePropertiesMethodArguments
		): {
			properties: PropertyDescriptor[];
			internalProperties?: InternalPropertyDescriptor[];
		};
		// Returns entries of given Map / Set collection.
		getCollectionEntries(params: GetCollectionEntriesMethodArguments): { entries: CollectionEntry[] };
		// Assign a saved result index to this value.
		saveResult(params: SaveResultMethodArguments): { savedResultIndex?: number };
		// Releases remote object with given id.
		releaseObject(params: ReleaseObjectMethodArguments): void;
		// Releases all remote objects that belong to a given group.
		releaseObjectGroup(params: ReleaseObjectGroupMethodArguments): void;
		// Enables reporting of execution contexts creation by means of <code>executionContextCreated</code> event. When the reporting gets enabled the event will be sent immediately for each existing execution context.
		enable(): void;
		// Disables reporting of execution contexts creation.
		disable(): void;
		// Returns detailed informtation on given function.
		getRuntimeTypesForVariablesAtOffsets(params: GetRuntimeTypesForVariablesAtOffsetsMethodArguments): { types: TypeDescription[] };
		// Enables type profiling on the VM.
		enableTypeProfiler(): void;
		// Disables type profiling on the VM.
		disableTypeProfiler(): void;
		// Enables control flow profiling on the VM.
		enableControlFlowProfiler(): void;
		// Disables control flow profiling on the VM.
		disableControlFlowProfiler(): void;
		// Returns a list of basic blocks for the given sourceID with information about their text ranges and whether or not they have executed.
		getBasicBlocks(params: GetBasicBlocksMethodArguments): { basicBlocks: BasicBlock[] };
	}
	export class RuntimeFrontend {
		// Issued when new execution context is created.
		executionContextCreated(context: ExecutionContextDescription): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Runtime.executionContextCreated',
					params: { context: context },
				})
			);
		}
	}
}

// Console
// Console domain defines methods and events for interaction with the JavaScript console. Console collects messages created by means of the <a href='http://getfirebug.com/wiki/index.php/Console_API'>JavaScript Console API</a>. One needs to enable this domain using <code>enable</code> command in order to start receiving the console messages. Browser collects messages issued while console domain is not enabled as well and reports them using <code>messageAdded</code> notification upon enabling.
export namespace ConsoleDomain {
	export interface ConsoleMessage {
		// Message source.
		source: any /* xml,javascript,network,console-api,storage,appcache,rendering,css,security,content-blocker,other */;
		// Message severity.
		level: any /* log,info,warning,error,debug */;
		// Message text.
		text: string;
		// Console message type.
		type?: any /* log,dir,dirxml,table,trace,clear,startGroup,startGroupCollapsed,endGroup,assert,timing,profile,profileEnd */;
		// URL of the message origin.
		url?: string;
		// Line number in the resource that generated this message.
		line?: number;
		// Column number on the line in the resource that generated this message.
		column?: number;
		// Repeat count for repeated messages.
		repeatCount?: number;
		// Message parameters in case of the formatted message.
		parameters?: RuntimeDomain.RemoteObject[];
		// JavaScript stack trace for assertions and error messages.
		stackTrace?: CallFrame[];
		// Identifier of the network request associated with this message.
		networkRequestId?: NetworkDomain.RequestId;
	}

	export interface CallFrame {
		// JavaScript function name.
		functionName: string;
		// JavaScript script name or url.
		url: string;
		// Script identifier.
		scriptId: DebuggerDomain.ScriptId;
		// JavaScript script line number.
		lineNumber: number;
		// JavaScript script column number.
		columnNumber: number;
	}

	export interface SetMonitoringXHREnabledMethodArguments {
		// Monitoring enabled state.
		enabled: boolean;
	}
	export interface AddInspectedNodeMethodArguments {
		// DOM node id to be accessible by means of $0 command line API.
		nodeId: DOMDomain.NodeId;
	}
	export interface ConsoleDomainDispatcher {
		// Enables console domain, sends the messages collected so far to the client by means of the <code>messageAdded</code> notification.
		enable(): void;
		// Disables console domain, prevents further console messages from being reported to the client.
		disable(): void;
		// Clears console messages collected in the browser.
		clearMessages(): void;
		// Toggles monitoring of XMLHttpRequest. If <code>true</code>, console will receive messages upon each XHR issued.
		setMonitoringXHREnabled(params: SetMonitoringXHREnabledMethodArguments): void;
		// Enables console to refer to the node with given id via $0 (see Command Line API for more details).
		addInspectedNode(params: AddInspectedNodeMethodArguments): void;
	}
	export class ConsoleFrontend {
		// Issued when new console message is added.
		messageAdded(message: ConsoleMessage): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Console.messageAdded',
					params: { message: message },
				})
			);
		}
		// Issued when subsequent message(s) are equal to the previous one(s).
		messageRepeatCountUpdated(count: number): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Console.messageRepeatCountUpdated',
					params: { count: count },
				})
			);
		}
		// Issued when console is cleared. This happens either upon <code>clearMessages</code> command or after page navigation.
		messagesCleared(): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Console.messagesCleared',
					params: {},
				})
			);
		}
		// Issued from console.takeHeapSnapshot.
		heapSnapshot(timestamp: number, snapshotData: HeapDomain.HeapSnapshotData, title?: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Console.heapSnapshot',
					params: {
						timestamp: timestamp,
						snapshotData: snapshotData,
						title: title,
					},
				})
			);
		}
	}
}

// GenericTypes
// Exposes generic types to be used by any domain.
export namespace GenericTypesDomain {
	export interface SearchMatch {
		// Line number in resource content.
		lineNumber: number;
		// Line with match content.
		lineContent: string;
	}
}

// Page
// Actions and events related to the inspected page belong to the page domain.
export namespace PageDomain {
	// Unique script identifier.
	export type ScriptIdentifier = string;

	export interface Frame {
		// Frame unique identifier.
		id: string;
		// Parent frame identifier.
		parentId?: string;
		// Identifier of the loader associated with this frame.
		loaderId: NetworkDomain.LoaderId;
		// Frame's name as specified in the tag.
		name?: string;
		// Frame document's URL.
		url: string;
		// Frame document's security origin.
		securityOrigin: string;
		// Frame document's mimeType as determined by the browser.
		mimeType: string;
	}

	export interface FrameResource {
		// Resource URL.
		url: string;
		// Type of this resource.
		type: ResourceType;
		// Resource mimeType as determined by the browser.
		mimeType: string;
		// True if the resource failed to load.
		failed?: boolean;
		// True if the resource was canceled during loading.
		canceled?: boolean;
		// URL of source map associated with this resource (if any).
		sourceMapURL?: string;
	}

	export interface FrameResourceTree {
		// Frame information for this tree item.
		frame: Frame;
		// Child frames.
		childFrames?: FrameResourceTree[];
		// Information about frame resources.
		resources: FrameResource[];
	}

	export interface SearchResult {
		// Resource URL.
		url: string;
		// Resource frame id.
		frameId: NetworkDomain.FrameId;
		// Number of matches in the resource content.
		matchesCount: number;
		// Network request id.
		requestId?: NetworkDomain.RequestId;
	}

	export interface Cookie {
		// Cookie name.
		name: string;
		// Cookie value.
		value: string;
		// Cookie domain.
		domain: string;
		// Cookie path.
		path: string;
		// Cookie expires.
		expires: number;
		// Cookie size.
		size: number;
		// True if cookie is http-only.
		httpOnly: boolean;
		// True if cookie is secure.
		secure: boolean;
		// True in case of session cookie.
		session: boolean;
	}

	export const enum ResourceType {
		Document,
		Stylesheet,
		Image,
		Font,
		Script,
		XHR,
		WebSocket,
		Other,
	}

	export const enum CoordinateSystem {
		Viewport,
		Page,
	}

	export interface AddScriptToEvaluateOnLoadMethodArguments {
		scriptSource: string;
	}
	export interface RemoveScriptToEvaluateOnLoadMethodArguments {
		identifier: ScriptIdentifier;
	}
	export interface ReloadMethodArguments {
		// If true, browser cache is ignored (as if the user pressed Shift+refresh).
		ignoreCache?: boolean;
		// If set, the script will be injected into all frames of the inspected page after reload.
		scriptToEvaluateOnLoad?: string;
	}
	export interface NavigateMethodArguments {
		// URL to navigate the page to.
		url: string;
	}
	export interface DeleteCookieMethodArguments {
		// Name of the cookie to remove.
		cookieName: string;
		// URL to match cooke domain and path.
		url: string;
	}
	export interface GetResourceContentMethodArguments {
		// Frame id to get resource for.
		frameId: NetworkDomain.FrameId;
		// URL of the resource to get content for.
		url: string;
	}
	export interface SearchInResourceMethodArguments {
		// Frame id for resource to search in.
		frameId: NetworkDomain.FrameId;
		// URL of the resource to search in.
		url: string;
		// String to search for.
		query: string;
		// If true, search is case sensitive.
		caseSensitive?: boolean;
		// If true, treats string parameter as regex.
		isRegex?: boolean;
		// Request id for resource to search in.
		requestId?: NetworkDomain.RequestId;
	}
	export interface SearchInResourcesMethodArguments {
		// String to search for.
		text: string;
		// If true, search is case sensitive.
		caseSensitive?: boolean;
		// If true, treats string parameter as regex.
		isRegex?: boolean;
	}
	export interface SetDocumentContentMethodArguments {
		// Frame id to set HTML for.
		frameId: NetworkDomain.FrameId;
		// HTML content to set.
		html: string;
	}
	export interface SetShowPaintRectsMethodArguments {
		// True for showing paint rectangles
		result: boolean;
	}
	export interface SetScriptExecutionDisabledMethodArguments {
		// Whether script execution should be disabled in the page.
		value: boolean;
	}
	export interface SetTouchEmulationEnabledMethodArguments {
		// Whether the touch event emulation should be enabled.
		enabled: boolean;
	}
	export interface SetEmulatedMediaMethodArguments {
		// Media type to emulate. Empty string disables the override.
		media: string;
	}
	export interface SetCompositingBordersVisibleMethodArguments {
		// True for showing compositing borders.
		visible: boolean;
	}
	export interface SnapshotNodeMethodArguments {
		// Id of the node to snapshot.
		nodeId: DOMDomain.NodeId;
	}
	export interface SnapshotRectMethodArguments {
		// X coordinate
		x: number;
		// Y coordinate
		y: number;
		// Rectangle width
		width: number;
		// Rectangle height
		height: number;
		// Indicates the coordinate system of the supplied rectangle.
		coordinateSystem: CoordinateSystem;
	}
	export interface HandleJavaScriptDialogMethodArguments {
		// Whether to accept or dismiss the dialog.
		accept: boolean;
		// The text to enter into the dialog prompt before accepting. Used only if this is a prompt dialog.
		promptText?: string;
	}
	export interface PageDomainDispatcher {
		// Enables page domain notifications.
		enable(): void;
		// Disables page domain notifications.
		disable(): void;
		addScriptToEvaluateOnLoad(params: AddScriptToEvaluateOnLoadMethodArguments): { identifier: ScriptIdentifier };
		removeScriptToEvaluateOnLoad(params: RemoveScriptToEvaluateOnLoadMethodArguments): void;
		// Reloads given page optionally ignoring the cache.
		reload(params: ReloadMethodArguments): void;
		// Navigates current page to the given URL.
		navigate(params: NavigateMethodArguments): void;
		// Returns all browser cookies. Depending on the backend support, will return detailed cookie information in the <code>cookies</code> field.
		getCookies(): { cookies: Cookie[] };
		// Deletes browser cookie with given name, domain and path.
		deleteCookie(params: DeleteCookieMethodArguments): void;
		// Returns present frame / resource tree structure.
		getResourceTree(): { frameTree: FrameResourceTree };
		// Returns content of the given resource.
		getResourceContent(params: GetResourceContentMethodArguments): { content: string; base64Encoded: boolean };
		// Searches for given string in resource content.
		searchInResource(params: SearchInResourceMethodArguments): { result: GenericTypesDomain.SearchMatch[] };
		// Searches for given string in frame / resource tree structure.
		searchInResources(params: SearchInResourcesMethodArguments): { result: SearchResult[] };
		// Sets given markup as the document's HTML.
		setDocumentContent(params: SetDocumentContentMethodArguments): void;
		// Requests that backend shows paint rectangles
		setShowPaintRects(params: SetShowPaintRectsMethodArguments): void;
		// Determines if scripts can be executed in the page.
		getScriptExecutionStatus(): {
			result: any /* allowed,disabled,forbidden */;
		};
		// Switches script execution in the page.
		setScriptExecutionDisabled(params: SetScriptExecutionDisabledMethodArguments): void;
		// Toggles mouse event-based touch event emulation.
		setTouchEmulationEnabled(params: SetTouchEmulationEnabledMethodArguments): void;
		// Emulates the given media for CSS media queries.
		setEmulatedMedia(params: SetEmulatedMediaMethodArguments): void;
		// Indicates the visibility of compositing borders.
		getCompositingBordersVisible(): { result: boolean };
		// Controls the visibility of compositing borders.
		setCompositingBordersVisible(params: SetCompositingBordersVisibleMethodArguments): void;
		// Capture a snapshot of the specified node that does not include unrelated layers.
		snapshotNode(params: SnapshotNodeMethodArguments): { dataURL: string };
		// Capture a snapshot of the page within the specified rectangle and coordinate system.
		snapshotRect(params: SnapshotRectMethodArguments): { dataURL: string };
		// Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).
		handleJavaScriptDialog(params: HandleJavaScriptDialogMethodArguments): void;
		// Grab an archive of the page.
		archive(): { data: string };
	}
	export class PageFrontend {
		domContentEventFired(timestamp: number): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.domContentEventFired',
					params: { timestamp: timestamp },
				})
			);
		}
		loadEventFired(timestamp: number): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.loadEventFired',
					params: { timestamp: timestamp },
				})
			);
		}
		// Fired once navigation of the frame has completed. Frame is now associated with the new loader.
		frameNavigated(frame: Frame): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.frameNavigated',
					params: { frame: frame },
				})
			);
		}
		// Fired when frame has been detached from its parent.
		frameDetached(frameId: NetworkDomain.FrameId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.frameDetached',
					params: { frameId: frameId },
				})
			);
		}
		// Fired when frame has started loading.
		frameStartedLoading(frameId: NetworkDomain.FrameId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.frameStartedLoading',
					params: { frameId: frameId },
				})
			);
		}
		// Fired when frame has stopped loading.
		frameStoppedLoading(frameId: NetworkDomain.FrameId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.frameStoppedLoading',
					params: { frameId: frameId },
				})
			);
		}
		// Fired when frame schedules a potential navigation.
		frameScheduledNavigation(frameId: NetworkDomain.FrameId, delay: number): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.frameScheduledNavigation',
					params: { frameId: frameId, delay: delay },
				})
			);
		}
		// Fired when frame no longer has a scheduled navigation.
		frameClearedScheduledNavigation(frameId: NetworkDomain.FrameId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.frameClearedScheduledNavigation',
					params: { frameId: frameId },
				})
			);
		}
		// Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to open.
		javascriptDialogOpening(message: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.javascriptDialogOpening',
					params: { message: message },
				})
			);
		}
		// Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been closed.
		javascriptDialogClosed(): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.javascriptDialogClosed',
					params: {},
				})
			);
		}
		// Fired when the JavaScript is enabled/disabled on the page
		scriptsEnabled(isEnabled: boolean): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Page.scriptsEnabled',
					params: { isEnabled: isEnabled },
				})
			);
		}
	}
}

// Network
// Network domain allows tracking network activities of the page. It exposes information about http, file, data and other requests and responses, their headers, bodies, timing, etc.
export namespace NetworkDomain {
	// Unique loader identifier.
	export type LoaderId = string;
	// Unique frame identifier.
	export type FrameId = string;
	// Unique request identifier.
	export type RequestId = string;
	// Number of seconds since epoch.
	export type Timestamp = number;

	export interface Headers {}

	export interface ResourceTiming {
		// Timing's startTime is a baseline in seconds, while the other numbers are ticks in milliseconds relatively to this.
		startTime: number;
		// Started DNS address resolve.
		domainLookupStart: number;
		// Finished DNS address resolve.
		domainLookupEnd: number;
		// Started connecting to the remote host.
		connectStart: number;
		// Connected to the remote host.
		connectEnd: number;
		// Started SSL handshake.
		secureConnectionStart: number;
		// Started sending request.
		requestStart: number;
		// Started receiving response headers.
		responseStart: number;
	}

	export interface Request {
		// Request URL.
		url: string;
		// HTTP request method.
		method: string;
		// HTTP request headers.
		headers: Headers;
		// HTTP POST request data.
		postData?: string;
	}

	export interface Response {
		// Response URL. This URL can be different from CachedResource.url in case of redirect.
		url: string;
		// HTTP response status code.
		status: number;
		// HTTP response status text.
		statusText: string;
		// HTTP response headers.
		headers: Headers;
		// HTTP response headers text.
		headersText?: string;
		// Resource mimeType as determined by the browser.
		mimeType: string;
		// Refined HTTP request headers that were actually transmitted over the network.
		requestHeaders?: Headers;
		// HTTP request headers text.
		requestHeadersText?: string;
		// Specifies that the request was served from the disk cache.
		fromDiskCache?: boolean;
		// Timing information for the given request.
		timing?: ResourceTiming;
	}

	export interface WebSocketRequest {
		// HTTP response headers.
		headers: Headers;
	}

	export interface WebSocketResponse {
		// HTTP response status code.
		status: number;
		// HTTP response status text.
		statusText: string;
		// HTTP response headers.
		headers: Headers;
	}

	export interface WebSocketFrame {
		// WebSocket frame opcode.
		opcode: number;
		// WebSocket frame mask.
		mask: boolean;
		// WebSocket frame payload data.
		payloadData: string;
	}

	export interface CachedResource {
		// Resource URL. This is the url of the original network request.
		url: string;
		// Type of this resource.
		type: PageDomain.ResourceType;
		// Cached response data.
		response?: Response;
		// Cached response body size.
		bodySize: number;
		// URL of source map associated with this resource (if any).
		sourceMapURL?: string;
	}

	export interface Initiator {
		// Type of this initiator.
		type: any /* parser,script,other */;
		// Initiator JavaScript stack trace, set for Script only.
		stackTrace?: ConsoleDomain.CallFrame[];
		// Initiator URL, set for Parser type only.
		url?: string;
		// Initiator line number, set for Parser type only.
		lineNumber?: number;
	}

	export interface SetExtraHTTPHeadersMethodArguments {
		// Map with extra HTTP headers.
		headers: Headers;
	}
	export interface GetResponseBodyMethodArguments {
		// Identifier of the network request to get content for.
		requestId: RequestId;
	}
	export interface SetCacheDisabledMethodArguments {
		// Cache disabled state.
		cacheDisabled: boolean;
	}
	export interface LoadResourceMethodArguments {
		// Frame to load the resource from.
		frameId: FrameId;
		// URL of the resource to load.
		url: string;
	}
	export interface NetworkDomainDispatcher {
		// Enables network tracking, network events will now be delivered to the client.
		enable(): void;
		// Disables network tracking, prevents network events from being sent to the client.
		disable(): void;
		// Specifies whether to always send extra HTTP headers with the requests from this page.
		setExtraHTTPHeaders(params: SetExtraHTTPHeadersMethodArguments): void;
		// Returns content served for the given request.
		getResponseBody(params: GetResponseBodyMethodArguments): { body: string; base64Encoded: boolean };
		// Toggles ignoring cache for each request. If <code>true</code>, cache will not be used.
		setCacheDisabled(params: SetCacheDisabledMethodArguments): void;
		// Loads a resource in the context of a frame on the inspected page without cross origin checks.
		loadResource(params: LoadResourceMethodArguments): { content: string; mimeType: string; status: number };
	}
	export class NetworkFrontend {
		// Fired when page is about to send HTTP request.
		requestWillBeSent(requestId: RequestId, frameId: FrameId, loaderId: LoaderId, documentURL: string, request: Request, timestamp: Timestamp, initiator: Initiator, redirectResponse?: Response, type?: PageDomain.ResourceType): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.requestWillBeSent',
					params: {
						requestId: requestId,
						frameId: frameId,
						loaderId: loaderId,
						documentURL: documentURL,
						request: request,
						timestamp: timestamp,
						initiator: initiator,
						redirectResponse: redirectResponse,
						type: type,
					},
				})
			);
		}
		// Fired if request ended up loading from cache.
		requestServedFromCache(requestId: RequestId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.requestServedFromCache',
					params: { requestId: requestId },
				})
			);
		}
		// Fired when HTTP response is available.
		responseReceived(requestId: RequestId, frameId: FrameId, loaderId: LoaderId, timestamp: Timestamp, type: PageDomain.ResourceType, response: Response): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.responseReceived',
					params: {
						requestId: requestId,
						frameId: frameId,
						loaderId: loaderId,
						timestamp: timestamp,
						type: type,
						response: response,
					},
				})
			);
		}
		// Fired when data chunk was received over the network.
		dataReceived(requestId: RequestId, timestamp: Timestamp, dataLength: number, encodedDataLength: number): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.dataReceived',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						dataLength: dataLength,
						encodedDataLength: encodedDataLength,
					},
				})
			);
		}
		// Fired when HTTP request has finished loading.
		loadingFinished(requestId: RequestId, timestamp: Timestamp, sourceMapURL?: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.loadingFinished',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						sourceMapURL: sourceMapURL,
					},
				})
			);
		}
		// Fired when HTTP request has failed to load.
		loadingFailed(requestId: RequestId, timestamp: Timestamp, errorText: string, canceled?: boolean): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.loadingFailed',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						errorText: errorText,
						canceled: canceled,
					},
				})
			);
		}
		// Fired when HTTP request has been served from memory cache.
		requestServedFromMemoryCache(requestId: RequestId, frameId: FrameId, loaderId: LoaderId, documentURL: string, timestamp: Timestamp, initiator: Initiator, resource: CachedResource): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.requestServedFromMemoryCache',
					params: {
						requestId: requestId,
						frameId: frameId,
						loaderId: loaderId,
						documentURL: documentURL,
						timestamp: timestamp,
						initiator: initiator,
						resource: resource,
					},
				})
			);
		}
		// Fired when WebSocket is about to initiate handshake.
		webSocketWillSendHandshakeRequest(requestId: RequestId, timestamp: Timestamp, request: WebSocketRequest): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.webSocketWillSendHandshakeRequest',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						request: request,
					},
				})
			);
		}
		// Fired when WebSocket handshake response becomes available.
		webSocketHandshakeResponseReceived(requestId: RequestId, timestamp: Timestamp, response: WebSocketResponse): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.webSocketHandshakeResponseReceived',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						response: response,
					},
				})
			);
		}
		// Fired upon WebSocket creation.
		webSocketCreated(requestId: RequestId, url: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.webSocketCreated',
					params: { requestId: requestId, url: url },
				})
			);
		}
		// Fired when WebSocket is closed.
		webSocketClosed(requestId: RequestId, timestamp: Timestamp): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.webSocketClosed',
					params: { requestId: requestId, timestamp: timestamp },
				})
			);
		}
		// Fired when WebSocket frame is received.
		webSocketFrameReceived(requestId: RequestId, timestamp: Timestamp, response: WebSocketFrame): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.webSocketFrameReceived',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						response: response,
					},
				})
			);
		}
		// Fired when WebSocket frame error occurs.
		webSocketFrameError(requestId: RequestId, timestamp: Timestamp, errorMessage: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.webSocketFrameError',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						errorMessage: errorMessage,
					},
				})
			);
		}
		// Fired when WebSocket frame is sent.
		webSocketFrameSent(requestId: RequestId, timestamp: Timestamp, response: WebSocketFrame): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'Network.webSocketFrameSent',
					params: {
						requestId: requestId,
						timestamp: timestamp,
						response: response,
					},
				})
			);
		}
	}
}

// DOM
// This domain exposes DOM read/write operations. Each DOM Node is represented with its mirror object that has an <code>id</code>. This <code>id</code> can be used to get additional information on the Node, resolve it into the JavaScript object wrapper, etc. It is important that client receives DOM events only for the nodes that are known to the client. Backend keeps track of the nodes that were sent to the client and never sends the same node twice. It is client's responsibility to collect information about the nodes that were sent to the client.
export namespace DOMDomain {
	// Unique DOM node identifier.
	export type NodeId = number;
	// Unique DOM node identifier used to reference a node that may not have been pushed to the front-end.
	export type BackendNodeId = number;

	export interface Node {
		// Node identifier that is passed into the rest of the DOM messages as the <code>nodeId</code>. Backend will only push node with given <code>id</code> once. It is aware of all requested nodes and will only fire DOM events for nodes known to the client.
		nodeId: NodeId;
		// <code>Node</code>'s nodeType.
		nodeType: number;
		// <code>Node</code>'s nodeName.
		nodeName: string;
		// <code>Node</code>'s localName.
		localName: string;
		// <code>Node</code>'s nodeValue.
		nodeValue: string;
		// Child count for <code>Container</code> nodes.
		childNodeCount?: number;
		// Child nodes of this node when requested with children.
		children?: Node[];
		// Attributes of the <code>Element</code> node in the form of flat array <code>[name1, value1, name2, value2]</code>.
		attributes?: string[];
		// Document URL that <code>Document</code> or <code>FrameOwner</code> node points to.
		documentURL?: string;
		// Base URL that <code>Document</code> or <code>FrameOwner</code> node uses for URL completion.
		baseURL?: string;
		// <code>DocumentType</code>'s publicId.
		publicId?: string;
		// <code>DocumentType</code>'s systemId.
		systemId?: string;
		// <code>Document</code>'s XML version in case of XML documents.
		xmlVersion?: string;
		// <code>Attr</code>'s name.
		name?: string;
		// <code>Attr</code>'s value.
		value?: string;
		// Pseudo element type for this node.
		pseudoType?: PseudoType;
		// Shadow root type.
		shadowRootType?: ShadowRootType;
		// Frame ID for frame owner elements.
		frameId?: NetworkDomain.FrameId;
		// Content document for frame owner elements.
		contentDocument?: Node;
		// Shadow root list for given element host.
		shadowRoots?: Node[];
		// Content document fragment for template elements
		templateContent?: Node;
		// Pseudo elements associated with this node.
		pseudoElements?: Node[];
		// Computed value for first recognized role token, default role per element, or overridden role.
		role?: string;
		// Computed SHA-256 Content Security Policy hash source for given element.
		contentSecurityPolicyHash?: string;
	}

	export interface RGBAColor {
		// The red component, in the [0-255] range.
		r: number;
		// The green component, in the [0-255] range.
		g: number;
		// The blue component, in the [0-255] range.
		b: number;
		// The alpha component, in the [0-1] range (default: 1).
		a?: number;
	}

	export interface HighlightConfig {
		// Whether the node info tooltip should be shown (default: false).
		showInfo?: boolean;
		// The content box highlight fill color (default: transparent).
		contentColor?: RGBAColor;
		// The padding highlight fill color (default: transparent).
		paddingColor?: RGBAColor;
		// The border highlight fill color (default: transparent).
		borderColor?: RGBAColor;
		// The margin highlight fill color (default: transparent).
		marginColor?: RGBAColor;
	}

	export const enum PseudoType {
		Before,
		After,
	}

	export const enum ShadowRootType {
		UserAgent,
		Open,
		Closed,
	}

	export const enum LiveRegionRelevant {
		Additions,
		Removals,
		Text,
	}

	export interface RemoveNodeMethodArguments {
		// Id of the node to remove.
		nodeId: NodeId;
	}
	export interface SetAttributeValueMethodArguments {
		// Id of the element to set attribute for.
		nodeId: NodeId;
		// Attribute name.
		name: string;
		// Attribute value.
		value: string;
	}
	export interface SetAttributesAsTextMethodArguments {
		// Id of the element to set attributes for.
		nodeId: NodeId;
		// Text with a number of attributes. Will parse this text using HTML parser.
		text: string;
		// Attribute name to replace with new attributes derived from text in case text parsed successfully.
		name?: string;
	}
	export interface RemoveAttributeMethodArguments {
		// Id of the element to remove attribute from.
		nodeId: NodeId;
		// Name of the attribute to remove.
		name: string;
	}
	export interface PerformSearchMethodArguments {
		// Plain text or query selector or XPath search query.
		query: string;
		// Ids of nodes to use as starting points for the search.
		nodeIds?: NodeId[];
	}
	export interface GetSearchResultsMethodArguments {
		// Unique search session identifier.
		searchId: string;
		// Start index of the search result to be returned.
		fromIndex: number;
		// End index of the search result to be returned.
		toIndex: number;
	}
	export interface DiscardSearchResultsMethodArguments {
		// Unique search session identifier.
		searchId: string;
	}
	export interface HighlightNodeMethodArguments {
		// A descriptor for the highlight appearance.
		highlightConfig: HighlightConfig;
		// Identifier of the node to highlight.
		nodeId?: NodeId;
		// JavaScript object id of the node to be highlighted.
		objectId?: RuntimeDomain.RemoteObjectId;
	}
	export interface ResolveNodeMethodArguments {
		// Id of the node to resolve.
		nodeId: NodeId;
		// Symbolic group name that can be used to release multiple objects.
		objectGroup?: string;
	}
	export interface DOMDomainDispatcher {
		enable(): void;
		disable(): void;
		// Returns the root DOM node to the caller.
		getDocument(): { root: Node };
		// Removes node with given id.
		removeNode(params: RemoveNodeMethodArguments): void;
		// Sets attribute for an element with given id.
		setAttributeValue(params: SetAttributeValueMethodArguments): void;
		// Sets attributes on element with given id. This method is useful when user edits some existing attribute value and types in several attribute name/value pairs.
		setAttributesAsText(params: SetAttributesAsTextMethodArguments): void;
		// Removes attribute with given name from an element with given id.
		removeAttribute(params: RemoveAttributeMethodArguments): void;
		// Searches for a given string in the DOM tree. Use <code>getSearchResults</code> to access search results or <code>cancelSearch</code> to end this search session.
		performSearch(params: PerformSearchMethodArguments): { searchId: string; resultCount: number };
		// Returns search results from given <code>fromIndex</code> to given <code>toIndex</code> from the sarch with the given identifier.
		getSearchResults(params: GetSearchResultsMethodArguments): { nodeIds: NodeId[] };
		// Discards search results from the session with the given id. <code>getSearchResults</code> should no longer be called for that search.
		discardSearchResults(params: DiscardSearchResultsMethodArguments): void;
		// Highlights DOM node with given id or with the given JavaScript object wrapper. Either nodeId or objectId must be specified.
		highlightNode(params: HighlightNodeMethodArguments): void;
		// Hides DOM node highlight.
		hideHighlight(): void;
		// Resolves JavaScript node object for given node id.
		resolveNode(params: ResolveNodeMethodArguments): { object: RuntimeDomain.RemoteObject };
	}
	export class DOMFrontend {
		// Fired when <code>Document</code> has been totally updated. Node ids are no longer valid.
		documentUpdated(): void {
			__inspectorSendEvent(JSON.stringify({ method: 'DOM.documentUpdated', params: {} }));
		}
		// Fired when backend wants to provide client with the missing DOM structure. This happens upon most of the calls requesting node ids.
		setChildNodes(parentId: NodeId, nodes: Node[]): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.setChildNodes',
					params: { parentId: parentId, nodes: nodes },
				})
			);
		}
		// Fired when <code>Element</code>'s attribute is modified.
		attributeModified(nodeId: NodeId, name: string, value: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.attributeModified',
					params: { nodeId: nodeId, name: name, value: value },
				})
			);
		}
		// Fired when <code>Element</code>'s attribute is removed.
		attributeRemoved(nodeId: NodeId, name: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.attributeRemoved',
					params: { nodeId: nodeId, name: name },
				})
			);
		}
		// Fired when <code>Element</code>'s inline style is modified via a CSS property modification.
		inlineStyleInvalidated(nodeIds: NodeId[]): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.inlineStyleInvalidated',
					params: { nodeIds: nodeIds },
				})
			);
		}
		// Mirrors <code>DOMCharacterDataModified</code> event.
		characterDataModified(nodeId: NodeId, characterData: string): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.characterDataModified',
					params: { nodeId: nodeId, characterData: characterData },
				})
			);
		}
		// Fired when <code>Container</code>'s child node count has changed.
		childNodeCountUpdated(nodeId: NodeId, childNodeCount: number): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.childNodeCountUpdated',
					params: { nodeId: nodeId, childNodeCount: childNodeCount },
				})
			);
		}
		// Mirrors <code>DOMNodeInserted</code> event.
		childNodeInserted(parentNodeId: NodeId, previousNodeId: NodeId, node: Node): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.childNodeInserted',
					params: {
						parentNodeId: parentNodeId,
						previousNodeId: previousNodeId,
						node: node,
					},
				})
			);
		}
		// Mirrors <code>DOMNodeRemoved</code> event.
		childNodeRemoved(parentNodeId: NodeId, nodeId: NodeId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.childNodeRemoved',
					params: { parentNodeId: parentNodeId, nodeId: nodeId },
				})
			);
		}
		// Called when shadow root is pushed into the element.
		shadowRootPushed(hostId: NodeId, root: Node): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.shadowRootPushed',
					params: { hostId: hostId, root: root },
				})
			);
		}
		// Called when shadow root is popped from the element.
		shadowRootPopped(hostId: NodeId, rootId: NodeId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.shadowRootPopped',
					params: { hostId: hostId, rootId: rootId },
				})
			);
		}
		// Called when a pseudo element is added to an element.
		pseudoElementAdded(parentId: NodeId, pseudoElement: Node): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.pseudoElementAdded',
					params: {
						parentId: parentId,
						pseudoElement: pseudoElement,
					},
				})
			);
		}
		// Called when a pseudo element is removed from an element.
		pseudoElementRemoved(parentId: NodeId, pseudoElementId: NodeId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'DOM.pseudoElementRemoved',
					params: {
						parentId: parentId,
						pseudoElementId: pseudoElementId,
					},
				})
			);
		}
	}
}

// CSS
// This domain exposes CSS read/write operations. All CSS objects (stylesheets, rules, and styles) have an associated 'id' used in subsequent operations on the related object. Each object type has a specific 'id' structure, and those are not interchangeable between objects of different kinds. CSS objects can be loaded using the <code>get*ForNode()</code> calls (which accept a DOM node id). A client can also discover all the existing stylesheets with the <code>getAllStyleSheets()</code> method (or keeping track of the <code>styleSheetAdded</code>/<code>styleSheetRemoved</code> events) and subsequently load the required stylesheet contents using the <code>getStyleSheet[Text]()</code> methods.
export namespace CSSDomain {
	export type StyleSheetId = string;

	export interface PseudoElementMatches {
		// Pseudo element type.
		pseudoType: DOMDomain.PseudoType;
		// Matches of CSS rules applicable to the pseudo style.
		matches: RuleMatch[];
	}

	export interface InheritedStyleEntry {
		// The ancestor node's inline style, if any, in the style inheritance chain.
		inlineStyle?: CSSStyle;
		// Matches of CSS rules matching the ancestor node in the style inheritance chain.
		matchedCSSRules: RuleMatch[];
	}

	export interface RuleMatch {
		// CSS rule in the match.
		rule: CSSRule;
		// Matching selector indices in the rule's selectorList selectors (0-based).
		matchingSelectors: number[];
	}

	export interface Value {
		// Value text.
		text: string;
		// Value range in the underlying resource (if available).
		range?: SourceRange;
	}

	export interface SelectorList {
		// Selectors in the list.
		selectors: Value[];
		// Rule selector text.
		text: string;
	}

	export interface CSSStyleSheetHeader {
		// The stylesheet identifier.
		styleSheetId: StyleSheetId;
		// Owner frame identifier.
		frameId: string;
		// Stylesheet resource URL.
		sourceURL: string;
		// URL of source map associated with the stylesheet (if any).
		sourceMapURL?: string;
		// Stylesheet origin.
		origin: StyleSheetOrigin;
		// Stylesheet title.
		title: string;
		// The backend id for the owner node of the stylesheet.
		ownerNode?: DOMDomain.BackendNodeId;
		// Denotes whether the stylesheet is disabled.
		disabled: boolean;
		// Whether the sourceURL field value comes from the sourceURL comment.
		hasSourceURL?: boolean;
		// Whether this stylesheet is created for STYLE tag by parser. This flag is not set for document.written STYLE tags.
		isInline: boolean;
		// Line offset of the stylesheet within the resource (zero based).
		startLine: number;
		// Column offset of the stylesheet within the resource (zero based).
		startColumn: number;
	}

	export interface CSSRule {
		// The css style sheet identifier (absent for user agent stylesheet and user-specified stylesheet rules) this rule came from.
		styleSheetId?: StyleSheetId;
		// Rule selector data.
		selectorList: SelectorList;
		// Parent stylesheet's origin.
		origin: StyleSheetOrigin;
		// Associated style declaration.
		style: CSSStyle;
		// Media list array (for rules involving media queries). The array enumerates media queries starting with the innermost one, going outwards.
		media?: CSSMedia[];
	}

	export interface SourceRange {
		// Start line of range.
		startLine: number;
		// Start column of range (inclusive).
		startColumn: number;
		// End line of range
		endLine: number;
		// End column of range (exclusive).
		endColumn: number;
	}

	export interface ShorthandEntry {
		// Shorthand name.
		name: string;
		// Shorthand value.
		value: string;
		// Whether the property has "!important" annotation (implies <code>false</code> if absent).
		important?: boolean;
	}

	export interface CSSComputedStyleProperty {
		// Computed style property name.
		name: string;
		// Computed style property value.
		value: string;
	}

	export interface CSSStyle {
		// The css style sheet identifier (absent for user agent stylesheet and user-specified stylesheet rules) this rule came from.
		styleSheetId?: StyleSheetId;
		// CSS properties in the style.
		cssProperties: CSSProperty[];
		// Computed values for all shorthands found in the style.
		shorthandEntries: ShorthandEntry[];
		// Style declaration text (if available).
		cssText?: string;
		// Style declaration range in the enclosing stylesheet (if available).
		range?: SourceRange;
	}

	export interface CSSProperty {
		// The property name.
		name: string;
		// The property value.
		value: string;
		// Whether the property has "!important" annotation (implies <code>false</code> if absent).
		important?: boolean;
		// Whether the property is implicit (implies <code>false</code> if absent).
		implicit?: boolean;
		// The full property text as specified in the style.
		text?: string;
		// Whether the property is understood by the browser (implies <code>true</code> if absent).
		parsedOk?: boolean;
		// Whether the property is disabled by the user (present for source-based properties only).
		disabled?: boolean;
		// The entire property range in the enclosing style declaration (if available).
		range?: SourceRange;
	}

	export interface CSSMedia {
		// Media query text.
		text: string;
		// Source of the media query: "mediaRule" if specified by a @media rule, "importRule" if specified by an @import rule, "linkedSheet" if specified by a "media" attribute in a linked stylesheet's LINK tag, "inlineSheet" if specified by a "media" attribute in an inline stylesheet's STYLE tag.
		source: any /* mediaRule,importRule,linkedSheet,inlineSheet */;
		// URL of the document containing the media query description.
		sourceURL?: string;
		// The associated rule (@media or @import) header range in the enclosing stylesheet (if available).
		range?: SourceRange;
		// Identifier of the stylesheet containing this object (if exists).
		styleSheetId?: StyleSheetId;
		// Array of media queries.
		mediaList?: MediaQuery[];
	}

	export interface MediaQuery {
		// Array of media query expressions.
		expressions: MediaQueryExpression[];
		// Whether the media query condition is satisfied.
		active: boolean;
	}

	export interface MediaQueryExpression {
		// Media query expression value.
		value: number;
		// Media query expression units.
		unit: string;
		// Media query expression feature.
		feature: string;
		// The associated range of the value text in the enclosing stylesheet (if available).
		valueRange?: SourceRange;
		// Computed length of media query expression (if applicable).
		computedLength?: number;
	}

	export interface PlatformFontUsage {
		// Font's family name reported by platform.
		familyName: string;
		// Indicates if the font was downloaded or resolved locally.
		isCustomFont: boolean;
		// Amount of glyphs that were rendered with this font.
		glyphCount: number;
	}

	export interface CSSKeyframesRule {
		// Animation name.
		animationName: Value;
		// List of keyframes.
		keyframes: CSSKeyframeRule[];
	}

	export interface CSSKeyframeRule {
		// The css style sheet identifier (absent for user agent stylesheet and user-specified stylesheet rules) this rule came from.
		styleSheetId?: StyleSheetId;
		// Parent stylesheet's origin.
		origin: StyleSheetOrigin;
		// Associated key text.
		keyText: Value;
		// Associated style declaration.
		style: CSSStyle;
	}

	export interface StyleDeclarationEdit {
		// The css style sheet identifier.
		styleSheetId: StyleSheetId;
		// The range of the style text in the enclosing stylesheet.
		range: SourceRange;
		// New style text.
		text: string;
	}

	export const enum StyleSheetOrigin {
		Injected,
		UserAgent,
		Inspector,
		Regular,
	}

	export interface GetMatchedStylesForNodeMethodArguments {
		nodeId: DOMDomain.NodeId;
	}
	export interface GetInlineStylesForNodeMethodArguments {
		nodeId: DOMDomain.NodeId;
	}
	export interface GetComputedStyleForNodeMethodArguments {
		nodeId: DOMDomain.NodeId;
	}
	export interface GetPlatformFontsForNodeMethodArguments {
		nodeId: DOMDomain.NodeId;
	}
	export interface GetStyleSheetTextMethodArguments {
		styleSheetId: StyleSheetId;
	}
	export interface CSSDomainDispatcher {
		// Enables the CSS agent for the given page. Clients should not assume that the CSS agent has been enabled until the result of this command is received.
		enable(): void;
		// Disables the CSS agent for the given page.
		disable(): void;
		// Returns requested styles for a DOM node identified by <code>nodeId</code>.
		getMatchedStylesForNode(
			params: GetMatchedStylesForNodeMethodArguments
		): {
			inlineStyle?: CSSStyle;
			attributesStyle?: CSSStyle;
			matchedCSSRules?: RuleMatch[];
			pseudoElements?: PseudoElementMatches[];
			inherited?: InheritedStyleEntry[];
			cssKeyframesRules?: CSSKeyframesRule[];
		};
		// Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM attributes) for a DOM node identified by <code>nodeId</code>.
		getInlineStylesForNode(params: GetInlineStylesForNodeMethodArguments): { inlineStyle?: CSSStyle; attributesStyle?: CSSStyle };
		// Returns the computed style for a DOM node identified by <code>nodeId</code>.
		getComputedStyleForNode(params: GetComputedStyleForNodeMethodArguments): { computedStyle: CSSComputedStyleProperty[] };
		// Requests information about platform fonts which we used to render child TextNodes in the given node.
		getPlatformFontsForNode(params: GetPlatformFontsForNodeMethodArguments): { fonts: PlatformFontUsage[] };
		// Returns the current textual content and the URL for a stylesheet.
		getStyleSheetText(params: GetStyleSheetTextMethodArguments): { text: string };
	}
	export class CSSFrontend {
		// Fires whenever a MediaQuery result changes (for example, after a browser window has been resized.) The current implementation considers only viewport-dependent media features.
		mediaQueryResultChanged(): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'CSS.mediaQueryResultChanged',
					params: {},
				})
			);
		}
		// Fires whenever a web font gets loaded.
		fontsUpdated(): void {
			__inspectorSendEvent(JSON.stringify({ method: 'CSS.fontsUpdated', params: {} }));
		}
		// Fired whenever a stylesheet is changed as a result of the client operation.
		styleSheetChanged(styleSheetId: StyleSheetId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'CSS.styleSheetChanged',
					params: { styleSheetId: styleSheetId },
				})
			);
		}
		// Fired whenever an active document stylesheet is added.
		styleSheetAdded(header: CSSStyleSheetHeader): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'CSS.styleSheetAdded',
					params: { header: header },
				})
			);
		}
		// Fired whenever an active document stylesheet is removed.
		styleSheetRemoved(styleSheetId: StyleSheetId): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'CSS.styleSheetRemoved',
					params: { styleSheetId: styleSheetId },
				})
			);
		}
		layoutEditorChange(styleSheetId: StyleSheetId, changeRange: SourceRange): void {
			__inspectorSendEvent(
				JSON.stringify({
					method: 'CSS.layoutEditorChange',
					params: {
						styleSheetId: styleSheetId,
						changeRange: changeRange,
					},
				})
			);
		}
	}
}
