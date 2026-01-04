/**
 * Angular HMR Transformer for NativeScript
 *
 * This module transforms Angular HMR update code from AnalogJS into a format
 * that can be executed directly on NativeScript devices.
 *
 * The key insight: AnalogJS generates HMR code designed for browser environments
 * with import.meta.hot and standard ES imports. NativeScript needs the code
 * pre-bundled with all dependencies resolved.
 *
 * Architecture:
 * 1. Parse the HMR function signature to extract parameter names
 * 2. Analyze which namespaces are accessed (ɵɵnamespaces[N])
 * 3. Bundle all dependencies inline so the client just executes
 * 4. Generate metadata so the client knows exactly what to provide
 */

export interface AngularHmrMetadata {
	/** Name of the component class (e.g., "SimpleTestComponent") */
	componentName: string;

	/** Relative path to the component file */
	componentPath: string;

	/** The update function name (e.g., "SimpleTestComponent_UpdateMetadata") */
	functionName: string;

	/** Parameter names in order (first is component class, second is ɵɵnamespaces, rest are locals) */
	parameters: string[];

	/** Number of namespace modules expected (ɵɵnamespaces array length) */
	namespacesCount: number;

	/** Local dependencies (everything after ɵɵnamespaces) */
	localDependencies: LocalDependency[];

	/** Timestamp of the update */
	timestamp: number;
}

export interface LocalDependency {
	name: string;
	/** Hint about where to find this dependency */
	sourceHint: '@angular/core' | '@nativescript/angular' | '@nativescript/core' | 'component' | 'unknown';
}

export interface TransformedHmrCode {
	/** The transformed code ready for execution */
	code: string;

	/** Metadata about the HMR update */
	metadata: AngularHmrMetadata;
}

/**
 * Parse the HMR function signature from the code.
 *
 * Expected format:
 * export default function ComponentName_UpdateMetadata(ComponentName, ɵɵnamespaces, Local1, Local2) {
 */
function parseHmrFunctionSignature(code: string): { functionName: string; parameters: string[] } | null {
	// Match: export default function FunctionName(param1, param2, ...)
	const match = code.match(/export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)/);
	if (!match) {
		return null;
	}

	const functionName = match[1];
	const paramsString = match[2];
	const parameters = paramsString
		.split(',')
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	return { functionName, parameters };
}

/**
 * Detect how many namespaces the HMR code expects.
 *
 * The Angular compiler generates code like:
 *   const ɵhmr0 = ɵɵnamespaces[0];
 *   const ɵhmr1 = ɵɵnamespaces[1];
 *
 * We find the highest index to determine the array size needed.
 */
function detectNamespacesCount(code: string): number {
	const matches = code.matchAll(/ɵɵnamespaces\s*\[\s*(\d+)\s*\]/g);
	let maxIndex = -1;

	for (const match of matches) {
		const index = parseInt(match[1], 10);
		if (index > maxIndex) {
			maxIndex = index;
		}
	}

	// Return count (max index + 1), minimum 1 for @angular/core
	return Math.max(1, maxIndex + 1);
}

/**
 * Extract the component name from the function name.
 *
 * Function names follow the pattern: ComponentName_UpdateMetadata
 */
function extractComponentName(functionName: string): string {
	const match = functionName.match(/^(\w+)_UpdateMetadata$/);
	return match ? match[1] : functionName;
}

/**
 * Analyze local dependencies and provide hints about their sources.
 */
function analyzeLocalDependencies(parameters: string[]): LocalDependency[] {
	// Skip first two parameters (component class and ɵɵnamespaces)
	const locals = parameters.slice(2);

	const angularCoreExports = new Set(['Component', 'Directive', 'Injectable', 'Pipe', 'NgModule', 'Input', 'Output', 'ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren', 'HostBinding', 'HostListener', 'Inject', 'Optional', 'Self', 'SkipSelf', 'Host', 'ChangeDetectionStrategy', 'ViewEncapsulation', 'EventEmitter', 'ElementRef', 'TemplateRef', 'ViewContainerRef', 'ChangeDetectorRef', 'Renderer2', 'NgZone', 'ApplicationRef', 'Injector', 'signal', 'computed', 'effect', 'input', 'output', 'model', 'viewChild', 'viewChildren', 'contentChild', 'contentChildren']);

	const nsAngularExports = new Set(['NativeScriptModule', 'NativeScriptCommonModule', 'NativeScriptFormsModule', 'NativeScriptRouterModule', 'NativeScriptHttpClientModule', 'registerElement', 'RouterExtensions', 'PageRoute', 'NSLocationStrategy']);

	const nsCoreExports = new Set(['Application', 'Frame', 'Page', 'View', 'Label', 'Button', 'TextField', 'ListView', 'ScrollView', 'StackLayout', 'GridLayout', 'FlexboxLayout', 'AbsoluteLayout', 'DockLayout', 'WrapLayout', 'Image', 'WebView', 'Observable', 'ObservableArray', 'Color', 'Screen', 'Device', 'Utils']);

	return locals.map((name) => {
		let sourceHint: LocalDependency['sourceHint'] = 'unknown';

		if (angularCoreExports.has(name)) {
			sourceHint = '@angular/core';
		} else if (nsAngularExports.has(name)) {
			sourceHint = '@nativescript/angular';
		} else if (nsCoreExports.has(name)) {
			sourceHint = '@nativescript/core';
		}

		return { name, sourceHint };
	});
}

/**
 * Transform the HMR code into a self-executing module format.
 *
 * Instead of relying on the client to parse and execute the function,
 * we wrap it in a format that:
 * 1. Exports the function as default
 * 2. Provides metadata about expected parameters
 * 3. Is ready for direct execution via dynamic import
 */
function transformCode(code: string, metadata: AngularHmrMetadata): string {
	// The code is already a valid ES module with `export default function ...`
	// We just need to ensure it's clean and add our metadata

	// Remove any import statements (they won't resolve on the client)
	// The HMR code from AnalogJS should already have no imports
	let transformed = code;

	// Add our metadata as an export so the client can read it
	const metadataExport = `
// NativeScript HMR Metadata
export const __nsHmrMetadata__ = ${JSON.stringify(metadata, null, 2)};
`;

	// Append metadata after the function
	transformed = transformed + '\n' + metadataExport;

	return transformed;
}

/**
 * Transform Angular HMR code from AnalogJS into NativeScript-ready format.
 *
 * @param rawCode The raw HMR code from AnalogJS's /@ng/component endpoint
 * @param componentPath The relative path to the component file
 * @param timestamp The update timestamp
 * @returns Transformed code with metadata, or null if parsing fails
 */
export function transformAngularHmrCode(rawCode: string, componentPath: string, timestamp: number): TransformedHmrCode | null {
	// Parse the function signature
	const signature = parseHmrFunctionSignature(rawCode);
	if (!signature) {
		console.warn('[angular-hmr] Failed to parse HMR function signature');
		return null;
	}

	// Extract component name from function name
	const componentName = extractComponentName(signature.functionName);

	// Detect how many namespaces are needed
	const namespacesCount = detectNamespacesCount(rawCode);

	// Analyze local dependencies
	const localDependencies = analyzeLocalDependencies(signature.parameters);

	// Build metadata
	const metadata: AngularHmrMetadata = {
		componentName,
		componentPath,
		functionName: signature.functionName,
		parameters: signature.parameters,
		namespacesCount,
		localDependencies,
		timestamp,
	};

	// Transform the code
	const code = transformCode(rawCode, metadata);

	return { code, metadata };
}

/**
 * Create a WebSocket message payload for Angular HMR.
 */
export function createAngularHmrMessage(transformed: TransformedHmrCode): object {
	return {
		type: 'ns:angular-hmr-v2',
		code: transformed.code,
		metadata: transformed.metadata,
	};
}
