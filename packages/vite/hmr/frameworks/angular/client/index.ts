declare const __NS_ENV_VERBOSE__: boolean | undefined;

type GetCoreFn = (name: string) => any;

export function installAngularHmrClientHooks(): void {
	const g: any = globalThis;
	if (g.__NS_ANGULAR_HMR_CLIENT_INSTALLED__) {
		return;
	}
	try {
		g.__NS_ANGULAR_HMR_CLIENT_INSTALLED__ = true;
		if (__NS_ENV_VERBOSE__) {
			console.log('[hmr-angular] client hooks installed');
		}
	} catch {}
}

interface AngularUpdateOptions {
	getCore: GetCoreFn;
	verbose: boolean;
}

/**
 * Rewrites AnalogJS HMR code to self-invoke the update function.
 *
 * The original HMR code structure:
 * ```
 * import { SimpleTestComponent } from "...";
 * import * as ɵɵnamespaces from "@angular/core";
 * import { NativeScriptCommonModule } from "...";
 * import { Component } from "@angular/core";
 * export default function SimpleTestComponent_UpdateMetadata(SimpleTestComponent, ɵɵnamespaces, NativeScriptCommonModule, Component) {
 *   // ... uses ɵɵreplaceMetadata
 * }
 * ```
 *
 * The function is exported but expects the imported values as parameters.
 * We rewrite it to call the function at the end with the imported values:
 * ```
 * import { SimpleTestComponent as _hmr_0 } from "...";
 * import * as _hmr_1 from "@angular/core";
 * import { NativeScriptCommonModule as _hmr_2 } from "...";
 * import { Component as _hmr_3 } from "@angular/core";
 *
 * function SimpleTestComponent_UpdateMetadata(SimpleTestComponent, ɵɵnamespaces, NativeScriptCommonModule, Component) {
 *   // ... uses ɵɵreplaceMetadata
 * }
 *
 * // Self-invoke with imported values
 * export const __hmrResult__ = (() => { try { SimpleTestComponent_UpdateMetadata(_hmr_0, _hmr_1, _hmr_2, _hmr_3); return true; } catch (e) { return e; } })();
 * export const __hmrError__ = __hmrResult__ === true ? null : __hmrResult__;
 * ```
 */
function rewriteHmrCodeToSelfInvoke(code: string, options: AngularUpdateOptions): string {
	try {
		// Parse imports to collect all import information first
		const importRegex = /import\s+(?:\*\s+as\s+(\w+)|{\s*([^}]+)\s*})\s+from\s+["']([^"']+)["'];?/g;
		const imports: { name: string; alias: string; source: string; isNamespace: boolean; originalName: string }[] = [];
		const importReplacements: { original: string; replacement: string }[] = [];
		let importIndex = 0;

		let match;
		while ((match = importRegex.exec(code)) !== null) {
			const [fullMatch, namespaceImport, namedImports, source] = match;

			if (namespaceImport) {
				// import * as name from 'source'
				const alias = `_hmr_${importIndex++}`;
				imports.push({
					name: namespaceImport,
					alias,
					source,
					isNamespace: true,
					originalName: namespaceImport,
				});
				importReplacements.push({
					original: fullMatch,
					replacement: `import * as ${alias} from "${source}";`,
				});
			} else if (namedImports) {
				// import { name } from 'source' or import { name as alias } from 'source'
				// or import { name1, name2 } from 'source'
				const parts = namedImports.split(',').map((p) => p.trim());
				const newImportParts: string[] = [];
				for (const part of parts) {
					const asMatch = part.match(/(\w+)\s+as\s+(\w+)/);
					const name = asMatch ? asMatch[2] : part;
					const originalName = asMatch ? asMatch[1] : part;
					const alias = `_hmr_${importIndex++}`;
					imports.push({
						name,
						alias,
						source,
						isNamespace: false,
						originalName,
					});
					newImportParts.push(`${originalName} as ${alias}`);
				}
				importReplacements.push({
					original: fullMatch,
					replacement: `import { ${newImportParts.join(', ')} } from "${source}";`,
				});
			}
		}

		if (imports.length === 0) {
			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular] no imports found in HMR code, using as-is');
			}
			return code;
		}

		// Apply all import replacements
		let modifiedCode = code;
		for (const { original, replacement } of importReplacements) {
			modifiedCode = modifiedCode.replace(original, replacement);
		}

		// Extract the function name from "export default function FnName(...)"
		const fnMatch = modifiedCode.match(/export\s+default\s+function\s+(\w+)\s*\(/);
		if (!fnMatch) {
			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular] no default function export found, using as-is');
			}
			return code;
		}

		const fnName = fnMatch[1];

		// Remove "export default" from the function declaration
		modifiedCode = modifiedCode.replace(/export\s+default\s+function/, 'function');

		// Get function parameter names in order (they match import order in AnalogJS generated code)
		const fnParamMatch = modifiedCode.match(new RegExp(`function\\s+${fnName}\\s*\\(([^)]*)\\)`));
		if (!fnParamMatch) {
			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular] could not parse function parameters');
			}
			return code;
		}

		const paramNames = fnParamMatch[1]
			.split(',')
			.map((p) => p.trim())
			.filter((p) => p);

		// Build the argument list: match param names to import names
		const args: string[] = [];
		for (const param of paramNames) {
			const importInfo = imports.find((i) => i.name === param);
			if (importInfo) {
				args.push(importInfo.alias);
			} else {
				// Parameter doesn't match an import - this shouldn't happen but handle it
				if (options.verbose && __NS_ENV_VERBOSE__) {
					console.log('[hmr-angular] param not found in imports:', param);
				}
				args.push('undefined');
			}
		}

		// Append self-invocation at the end
		const selfInvoke = `
// HMR self-invocation
export const __hmrResult__ = (() => { try { ${fnName}(${args.join(', ')}); return true; } catch (e) { console.error('[hmr] update error:', e); return false; } })();
export const __hmrError__ = __hmrResult__ === true ? null : __hmrResult__;
`;

		modifiedCode += selfInvoke;

		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular] rewritten HMR code:', modifiedCode.substring(0, 800));
		}

		return modifiedCode;
	} catch (e) {
		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular] failed to rewrite HMR code:', e);
		}
		// Return original code on error
		return code;
	}
}

/**
 * Handle Angular component-level HMR update with ɵɵreplaceMetadata code.
 * This is called when AnalogJS generates HMR update code for a component.
 *
 * The HMR code is an ES module with this structure:
 * ```
 * import { ... } from '@angular/core';
 * import { ComponentClass } from './component-path';
 * import { SomeModule } from 'some-module';
 * export default function ComponentClass_UpdateMetadata(ComponentClass, ɵɵnamespaces, SomeModule, Component) {
 *   // calls to ɵɵreplaceMetadata
 * }
 * ```
 *
 * We use blob URLs with the runtime's Blob implementation:
 * 1. Create a Blob from the HMR code
 * 2. Create a blob URL via URL.createObjectURL()
 * 3. Dynamic import the blob URL
 * 4. The runtime reads the blob content via blob.text() and compiles it as a module
 */
export async function handleAngularHmrCodeMessage(msg: any, options: AngularUpdateOptions): Promise<boolean> {
	if (!msg || msg.type !== 'ns:angular-hmr-code') {
		return false;
	}

	const code = msg.code;
	if (!code || typeof code !== 'string') {
		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.warn('[hmr-angular] received empty HMR code');
		}
		return false;
	}

	const g: any = globalThis;

	try {
		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular] executing HMR update code, length:', code.length);
			console.log('[hmr-angular] code preview:', code.substring(0, 500));
			// Print more of the code to understand its structure
			console.log('[hmr-angular] code middle:', code.substring(500, 1500));
		}

		// Rewrite the HMR code to self-invoke the update function
		// The AnalogJS HMR code exports a function that takes the imported values as parameters,
		// but we need to call it with those values. We'll append a self-call at the end.
		const modifiedCode = rewriteHmrCodeToSelfInvoke(code, options);

		// Create a Blob from the HMR code and use dynamic import
		// The runtime now has a proper Blob implementation with text() support
		const blob = new Blob([modifiedCode], { type: 'application/javascript' });
		const blobUrl = URL.createObjectURL(blob);

		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular] created blob URL:', blobUrl);
		}

		try {
			// Dynamic import the blob URL - the runtime will call blob.text() to get the code
			const module = await import(blobUrl);

			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular] HMR module imported successfully');
				console.log('[hmr-angular] module exports:', Object.keys(module));
			}

			// Check if the module self-invoked (has __hmrResult__)
			if (module.__hmrResult__ === true) {
				if (options.verbose && __NS_ENV_VERBOSE__) {
					console.log('[hmr-angular] HMR update executed successfully during module load');
				}
			} else if (module.__hmrError__) {
				if (options.verbose) {
					console.warn('[hmr-angular] HMR update failed:', module.__hmrError__);
				}
				triggerRebootstrap(g, options);
				return true;
			} else if (typeof module.default === 'function') {
				// The HMR code has no imports - it's a function that expects resolved arguments
				// We need to call it manually with the resolved dependencies
				if (options.verbose && __NS_ENV_VERBOSE__) {
					console.log('[hmr-angular] HMR code has default function export, calling with resolved args');
				}

				const updateFn = module.default;
				const fnName = updateFn.name || 'unknown';

				// Parse the function signature to get parameter names
				const fnStr = updateFn.toString();
				const paramMatch = fnStr.match(/^function\s*\w*\s*\(([^)]*)\)/);
				const params = paramMatch
					? paramMatch[1]
							.split(',')
							.map((p: string) => p.trim())
							.filter(Boolean)
					: [];

				if (options.verbose && __NS_ENV_VERBOSE__) {
					console.log('[hmr-angular] update function:', fnName);
					console.log('[hmr-angular] parameters:', params);
				}

				// Resolve the arguments
				const args = resolveHmrFunctionArgs(params, code, options, g);

				if (options.verbose && __NS_ENV_VERBOSE__) {
					console.log('[hmr-angular] resolved args count:', args.length);
					// Print detailed info about each argument
					for (let i = 0; i < args.length; i++) {
						const arg = args[i];
						const argType = typeof arg;
						const argName = (arg && arg.name) || (arg && arg.constructor && arg.constructor.name) || argType;
						console.log(`[hmr-angular] arg[${i}] type:`, argType, 'name:', argName);
						if (i === 1 && Array.isArray(arg)) {
							// ɵɵnamespaces array - check what's in it
							console.log('[hmr-angular] ɵɵnamespaces length:', arg.length);
							for (let j = 0; j < arg.length; j++) {
								const ns = arg[j];
								console.log(`[hmr-angular] namespace[${j}] has ɵɵreplaceMetadata:`, !!(ns && ns.ɵɵreplaceMetadata));
								if (j === 0 && ns) {
									// First namespace should be @angular/core
									console.log('[hmr-angular] namespace[0].ɵɵreplaceMetadata type:', typeof ns.ɵɵreplaceMetadata);
									console.log('[hmr-angular] namespace[0].ɵɵdefineComponent type:', typeof ns.ɵɵdefineComponent);
								}
							}
						}
					}
				}

				// Capture the component's tView before the update
				let tViewBefore: any = null;
				const componentClass = args[0];
				if (componentClass) {
					const compDefBefore = componentClass.ɵcmp || componentClass['ɵcmp'];
					if (compDefBefore) {
						tViewBefore = compDefBefore.tView;
						if (options.verbose && __NS_ENV_VERBOSE__) {
							console.log('[hmr-angular] BEFORE: component tView exists:', !!tViewBefore);
						}
					}
				}

				// Instrument ɵɵreplaceMetadata to verify it's being called
				const namespacesArg = args[1];
				let replaceMetadataCalled = false;
				if (namespacesArg && Array.isArray(namespacesArg) && namespacesArg[0]) {
					const angularCoreNs = namespacesArg[0];
					const originalReplaceMetadata = angularCoreNs.ɵɵreplaceMetadata;
					if (originalReplaceMetadata && options.verbose && __NS_ENV_VERBOSE__) {
						angularCoreNs.ɵɵreplaceMetadata = function (...replaceArgs: any[]) {
							replaceMetadataCalled = true;
							console.log('[hmr-angular] ɵɵreplaceMetadata CALLED!');
							console.log('[hmr-angular] replaceMetadata args count:', replaceArgs.length);
							console.log('[hmr-angular] replaceMetadata type:', replaceArgs[0]?.name);
							console.log('[hmr-angular] replaceMetadata applyMetadata:', typeof replaceArgs[1]);
							console.log('[hmr-angular] replaceMetadata namespaces length:', replaceArgs[2]?.length);
							console.log('[hmr-angular] replaceMetadata locals:', replaceArgs[3]);
							try {
								const result = originalReplaceMetadata.apply(this, replaceArgs);
								console.log('[hmr-angular] ɵɵreplaceMetadata completed successfully');
								return result;
							} catch (e) {
								console.error('[hmr-angular] ɵɵreplaceMetadata threw error:', e);
								throw e;
							}
						};
					}
				}

				try {
					updateFn(...args);

					// Check the component's tView after the update
					if (options.verbose && __NS_ENV_VERBOSE__) {
						console.log('[hmr-angular] HMR update function executed successfully');
						console.log('[hmr-angular] ɵɵreplaceMetadata was called:', replaceMetadataCalled);

						const compDefAfter = componentClass && (componentClass.ɵcmp || componentClass['ɵcmp']);
						if (compDefAfter) {
							const tViewAfter = compDefAfter.tView;
							console.log('[hmr-angular] AFTER: component tView exists:', !!tViewAfter);
							console.log('[hmr-angular] tView same object?:', tViewBefore === tViewAfter);
							console.log('[hmr-angular] component def id:', compDefAfter.id);
						}

						// Check if Angular's LViews are being tracked
						const angularCore = options.getCore('@angular/core');
						if (angularCore) {
							// Restore the original ɵɵreplaceMetadata if we wrapped it
							if (namespacesArg && Array.isArray(namespacesArg) && namespacesArg[0]) {
								const angularCoreNs = namespacesArg[0];
								const originalFn = options.getCore('@angular/core').ɵɵreplaceMetadata;
								if (originalFn) {
									angularCoreNs.ɵɵreplaceMetadata = originalFn;
								}
							}

							// Try to access tracked LViews - this is what ɵɵreplaceMetadata iterates
							const getTrackedLViews = angularCore.ɵgetTrackedLViews || angularCore['ɵgetTrackedLViews'];
							if (getTrackedLViews) {
								const tracked = getTrackedLViews();
								console.log('[hmr-angular] tracked LViews:', tracked ? (tracked.size ?? 'Map exists') : 'null');
							} else {
								console.log('[hmr-angular] ɵgetTrackedLViews not found in @angular/core');
							}
						}
					}
				} catch (updateError) {
					if (options.verbose) {
						console.warn('[hmr-angular] HMR update function failed:', updateError);
					}
					triggerRebootstrap(g, options);
					return true;
				}
			}

			// Trigger change detection to update the view
			const appRef = g.__NS_ANGULAR_APP_REF__;
			if (appRef && typeof appRef.tick === 'function') {
				if (options.verbose && __NS_ENV_VERBOSE__) {
					console.log('[hmr-angular] triggering change detection');
				}

				// For template changes, we need to do more than just tick()
				// The ɵɵreplaceMetadata updates the component definition, but existing
				// component instances still have the old compiled view.
				// We need to trigger a view refresh or re-creation.

				// Try to get the component and refresh its view
				try {
					if (appRef.components && appRef.components.length > 0) {
						for (const componentRef of appRef.components) {
							// Mark the component for check to force re-render
							if (componentRef.changeDetectorRef) {
								componentRef.changeDetectorRef.markForCheck();
								if (options.verbose && __NS_ENV_VERBOSE__) {
									console.log('[hmr-angular] marked component for check');
								}
							}

							// Try to use the internal _view or hostView to force refresh
							const hostView = (componentRef as any).hostView || (componentRef as any)._view;
							if (hostView && typeof hostView.detectChanges === 'function') {
								hostView.detectChanges();
								if (options.verbose && __NS_ENV_VERBOSE__) {
									console.log('[hmr-angular] triggered detectChanges on hostView');
								}
							}
						}
					}
				} catch (e) {
					if (options.verbose && __NS_ENV_VERBOSE__) {
						console.log('[hmr-angular] view refresh attempt:', e);
					}
				}

				// Run tick to flush any pending changes
				appRef.tick();

				// For NativeScript, we may need to force a native view update
				try {
					const rootView = g.Application?.getRootView?.();
					if (rootView && typeof rootView.requestLayout === 'function') {
						rootView.requestLayout();
						if (options.verbose && __NS_ENV_VERBOSE__) {
							console.log('[hmr-angular] requested layout on root view');
						}
					}
				} catch {}
			}

			return true;
		} catch (importError) {
			if (options.verbose) {
				console.warn('[hmr-angular] blob import failed:', importError);
			}
			// Clean up the blob URL
			try {
				URL.revokeObjectURL(blobUrl);
			} catch {}
			// Fall back to manual parsing approach
			return handleAngularHmrCodeManually(code, options, g);
		} finally {
			// Clean up the blob URL after import
			try {
				URL.revokeObjectURL(blobUrl);
			} catch {}
		}
	} catch (error) {
		if (options.verbose) {
			try {
				console.warn('[hmr-angular] failed to handle HMR code', (error && (error as any).message) || error);
			} catch {}
		}
		triggerRebootstrap(g, options);
	}
	return true;
}

/**
 * Fallback: Manually parse and execute HMR code when blob import fails.
 * This handles older runtimes or environments without blob URL support.
 */
function handleAngularHmrCodeManually(code: string, options: AngularUpdateOptions, g: any): boolean {
	try {
		// Extract the default export function signature to understand what arguments are needed
		// Pattern: export default function ComponentName_UpdateMetadata(ComponentName, ɵɵnamespaces, ...modules)
		const fnMatch = code.match(/export\s+default\s+function\s+(\w+)\s*\(([^)]*)\)/);
		if (!fnMatch) {
			if (options.verbose) {
				console.warn('[hmr-angular][manual] Could not parse HMR function signature');
			}
			triggerRebootstrap(g, options);
			return true;
		}

		const fnName = fnMatch[1]; // e.g., "SimpleTestComponent_UpdateMetadata"
		const params = fnMatch[2]
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean);

		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular][manual] Function name:', fnName);
			console.log('[hmr-angular][manual] Parameters:', params);
		}

		// The first param is the component class name
		// The second param is ɵɵnamespaces (Angular internal)
		// The remaining params are imported modules/decorators

		const componentClassName = params[0]; // e.g., "SimpleTestComponent"

		// Parse import statements to build a module map
		// Format: import { x, y as z } from 'module-path';
		const importMap: Record<string, { source: string; original: string }> = {};
		const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
		let importMatch;
		while ((importMatch = importRegex.exec(code)) !== null) {
			const imports = importMatch[1];
			const source = importMatch[2];

			// Parse each import: "name" or "name as alias"
			imports.split(',').forEach((imp) => {
				imp = imp.trim();
				if (!imp) return;

				const asMatch = imp.match(/(\w+)\s+as\s+(\w+)/);
				if (asMatch) {
					importMap[asMatch[2]] = { source, original: asMatch[1] };
				} else {
					importMap[imp] = { source, original: imp };
				}
			});
		}

		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular][manual] Import map:', JSON.stringify(importMap, null, 2));
		}

		// Resolve the component class
		let componentClass: any = null;

		// Try to find the component from the import map
		const componentImport = importMap[componentClassName];
		if (componentImport) {
			// Try to get the component from our module registry
			const moduleRegistry = g.__NS_HMR_MODULE_REGISTRY__;
			if (moduleRegistry) {
				for (const [modPath, mod] of Object.entries(moduleRegistry)) {
					if (mod && typeof mod === 'object') {
						const moduleObj = mod as Record<string, any>;
						if (moduleObj[componentClassName]) {
							componentClass = moduleObj[componentClassName];
							if (options.verbose && __NS_ENV_VERBOSE__) {
								console.log('[hmr-angular][manual] Found component in module:', modPath);
							}
							break;
						}
					}
				}
			}

			// Also try the global component registry
			if (!componentClass && g.__NS_ANGULAR_COMPONENTS__) {
				componentClass = g.__NS_ANGULAR_COMPONENTS__[componentClassName];
			}
		}

		if (!componentClass) {
			if (options.verbose) {
				console.warn('[hmr-angular][manual] Could not find component class:', componentClassName);
			}
			triggerRebootstrap(g, options);
			return true;
		}

		// Build the arguments array for the update function
		const args: any[] = [];
		for (const param of params) {
			if (param === componentClassName) {
				args.push(componentClass);
			} else if (param === 'ɵɵnamespaces') {
				// This is an array of Angular namespace objects
				const core = options.getCore('@angular/core');
				const namespaces = core ? [core] : [];
				args.push(namespaces);
			} else {
				// Look up in import map and resolve
				const imp = importMap[param];
				if (imp) {
					const resolved = resolveImport(imp.source, imp.original, options, g);
					args.push(resolved);
				} else {
					// Try to get from @angular/core
					const core = options.getCore('@angular/core');
					if (core && core[param]) {
						args.push(core[param]);
					} else {
						args.push(undefined);
					}
				}
			}
		}

		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular][manual] Resolved args count:', args.length);
		}

		// Extract the function body and create a callable function
		const fnStartIndex = code.indexOf(fnMatch[0]);
		const fnBodyStart = code.indexOf('{', fnStartIndex);
		if (fnBodyStart === -1) {
			if (options.verbose) {
				console.warn('[hmr-angular][manual] Could not find function body');
			}
			triggerRebootstrap(g, options);
			return true;
		}

		// Find matching closing brace for the function
		let braceCount = 0;
		let fnBodyEnd = -1;
		for (let i = fnBodyStart; i < code.length; i++) {
			if (code[i] === '{') braceCount++;
			else if (code[i] === '}') {
				braceCount--;
				if (braceCount === 0) {
					fnBodyEnd = i;
					break;
				}
			}
		}

		if (fnBodyEnd === -1) {
			if (options.verbose) {
				console.warn('[hmr-angular][manual] Could not find function end');
			}
			triggerRebootstrap(g, options);
			return true;
		}

		const fnBody = code.substring(fnBodyStart + 1, fnBodyEnd);

		// Create the function with parameters
		try {
			const updateFn = new Function(...params, fnBody);

			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular][manual] Created update function, calling with', args.length, 'args');
			}

			// Call the update function
			updateFn.apply(null, args);

			if (options.verbose && __NS_ENV_VERBOSE__) {
				console.log('[hmr-angular][manual] HMR update function executed successfully');
			}

			// Trigger change detection to update the view
			const appRef = g.__NS_ANGULAR_APP_REF__;
			if (appRef && typeof appRef.tick === 'function') {
				appRef.tick();
			}

			return true;
		} catch (evalError) {
			if (options.verbose) {
				console.warn('[hmr-angular][manual] Function evaluation failed:', evalError);
			}
			triggerRebootstrap(g, options);
			return true;
		}
	} catch (error) {
		if (options.verbose) {
			console.warn('[hmr-angular][manual] failed to handle HMR code', error);
		}
		triggerRebootstrap(g, options);
	}
	return true;
}

/**
 * Detect how many namespaces the HMR code expects by parsing namespace access patterns.
 * The HMR code contains lines like: const ɵhmr0 = ɵɵnamespaces[0];
 * We find the highest index to determine the number of namespaces needed.
 */
function detectExpectedNamespaces(code: string): number {
	// Look for patterns like: ɵɵnamespaces[0], ɵɵnamespaces[1], etc.
	const pattern = /ɵɵnamespaces\[(\d+)\]/g;
	let maxIndex = -1;
	let match;
	while ((match = pattern.exec(code)) !== null) {
		const index = parseInt(match[1], 10);
		if (index > maxIndex) {
			maxIndex = index;
		}
	}
	// Also check for patterns like: const ɵhmr0 = ɵɵnamespaces[0];
	const hmrPattern = /const\s+ɵhmr(\d+)\s*=\s*ɵɵnamespaces\[(\d+)\]/g;
	while ((match = hmrPattern.exec(code)) !== null) {
		const index = parseInt(match[2], 10);
		if (index > maxIndex) {
			maxIndex = index;
		}
	}
	// Return the count (max index + 1), minimum of 1 for @angular/core
	return Math.max(1, maxIndex + 1);
}

/**
 * Resolve the arguments for an HMR update function based on its parameter names.
 * The parameters typically follow this pattern:
 * - First param: The component class name (e.g., SimpleTestComponent)
 * - Second param: ɵɵnamespaces (array of Angular core namespaces)
 * - Remaining params: Imported modules/decorators (e.g., NativeScriptCommonModule, Component)
 */
function resolveHmrFunctionArgs(params: string[], code: string, options: AngularUpdateOptions, g: any): any[] {
	const args: any[] = [];

	// Load the core modules once - these are the canonical sources
	const angularCore = options.getCore('@angular/core');
	const nsAngular = options.getCore('@nativescript/angular');
	const nsCore = options.getCore('@nativescript/core');

	if (options.verbose && __NS_ENV_VERBOSE__) {
		console.log('[hmr-angular] resolving args for params:', params);
		console.log('[hmr-angular] modules loaded - @angular/core:', !!angularCore, '@nativescript/angular:', !!nsAngular, '@nativescript/core:', !!nsCore);
	}

	// The first parameter is the component class name
	const componentClassName = params[0];

	// Build ɵɵnamespaces array - this contains Angular namespace modules indexed by namespace
	// The Angular compiler generates HMR code that accesses namespaces by index:
	// - const ɵhmr0 = ɵɵnamespaces[0]; // typically @angular/core
	// - const ɵhmr1 = ɵɵnamespaces[1]; // other namespace if needed
	//
	// We need to detect how many namespaces the HMR code expects by parsing it.
	const namespacesExpected = detectExpectedNamespaces(code);

	if (options.verbose && __NS_ENV_VERBOSE__) {
		console.log('[hmr-angular] namespaces expected by HMR code:', namespacesExpected);
	}

	// Load namespace modules in order
	// By convention, namespace 0 is almost always @angular/core
	const availableNamespaces: any[] = [angularCore, options.getCore('@angular/common'), options.getCore('@angular/router'), options.getCore('@angular/forms'), nsAngular].filter(Boolean);

	// Build namespaces array with exactly the number expected
	const namespaces: any[] = [];
	for (let i = 0; i < namespacesExpected; i++) {
		if (i < availableNamespaces.length) {
			namespaces.push(availableNamespaces[i]);
		} else {
			// Fill with empty object if we don't have enough namespaces
			namespaces.push({});
		}
	}

	if (options.verbose && __NS_ENV_VERBOSE__) {
		console.log('[hmr-angular] namespaces array length:', namespaces.length);
	}

	// Resolve each parameter
	for (let i = 0; i < params.length; i++) {
		const param = params[i];
		let resolved: any = undefined;
		let source = '';

		if (param === 'ɵɵnamespaces') {
			// Special: array of Angular namespace objects
			resolved = namespaces;
			source = 'namespaces array';
		} else if (i === 0) {
			// First param is the component class - look it up
			resolved = findComponentClass(param, g, options);
			source = resolved ? '__NS_ANGULAR_COMPONENTS__' : 'not found';
		} else {
			// Try to resolve from known modules in priority order
			// 1. @angular/core - decorators, DI, etc.
			if (angularCore && angularCore[param] !== undefined) {
				resolved = angularCore[param];
				source = '@angular/core';
			}
			// 2. @nativescript/angular - NativeScript Angular modules
			else if (nsAngular && nsAngular[param] !== undefined) {
				resolved = nsAngular[param];
				source = '@nativescript/angular';
			}
			// 3. @nativescript/core - core UI classes
			else if (nsCore && nsCore[param] !== undefined) {
				resolved = nsCore[param];
				source = '@nativescript/core';
			}
			// 4. Try other common Angular packages
			else {
				const otherPackages = ['@angular/common', '@angular/forms', '@angular/router', '@angular/platform-browser'];
				for (const pkg of otherPackages) {
					const mod = options.getCore(pkg);
					if (mod && mod[param] !== undefined) {
						resolved = mod[param];
						source = pkg;
						break;
					}
				}
			}

			// 5. Last resort: scan vendor registry for any module with this export
			if (resolved === undefined) {
				try {
					const vendorReg: Map<string, any> | undefined = g.__nsVendorRegistry;
					if (vendorReg && typeof vendorReg.forEach === 'function') {
						vendorReg.forEach((mod: any, path: string) => {
							if (resolved === undefined && mod && typeof mod === 'object') {
								if (mod[param] !== undefined) {
									resolved = mod[param];
									source = `vendor:${path}`;
								} else if (mod.default && mod.default[param] !== undefined) {
									resolved = mod.default[param];
									source = `vendor:${path}.default`;
								}
							}
						});
					}
				} catch {}
			}
		}

		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log(`[hmr-angular] arg[${i}] ${param} = ${resolved !== undefined ? source : 'UNDEFINED'}`);
		}

		args.push(resolved);
	}

	return args;
}

/**
 * Find a component class by name from available registries.
 */
function findComponentClass(name: string, g: any, options: AngularUpdateOptions): any {
	// 1. Check __NS_ANGULAR_COMPONENTS__ - registered during bootstrap
	if (g.__NS_ANGULAR_COMPONENTS__ && g.__NS_ANGULAR_COMPONENTS__[name]) {
		return g.__NS_ANGULAR_COMPONENTS__[name];
	}

	// 2. Check HMR module registry
	const moduleRegistry = g.__NS_HMR_MODULE_REGISTRY__;
	if (moduleRegistry) {
		for (const [, mod] of Object.entries(moduleRegistry)) {
			if (mod && typeof mod === 'object') {
				const moduleObj = mod as Record<string, any>;
				if (moduleObj[name]) return moduleObj[name];
			}
		}
	}

	// 3. Check vendor registry
	try {
		const vendorReg: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (vendorReg && typeof vendorReg.forEach === 'function') {
			let found: any = undefined;
			vendorReg.forEach((mod: any) => {
				if (!found && mod && typeof mod === 'object') {
					const moduleObj = mod.default || mod;
					if (moduleObj && moduleObj[name]) {
						found = moduleObj[name];
					}
				}
			});
			if (found) return found;
		}
	} catch {}

	// 4. Check globalThis
	if (g[name]) return g[name];

	return undefined;
}

/**
 * Resolve an import to its value using the universal module resolver.
 */
function resolveImport(source: string, name: string, options: AngularUpdateOptions, g: any): any {
	// Use the universal module resolver
	const mod = options.getCore(source);
	if (mod) {
		if (mod[name] !== undefined) return mod[name];
		if (mod.default && mod.default[name] !== undefined) return mod.default[name];
	}

	// Fallback: check module registry for relative imports
	if (source.startsWith('./') || source.startsWith('../')) {
		const moduleRegistry = g.__NS_HMR_MODULE_REGISTRY__;
		if (moduleRegistry) {
			for (const [modPath, mod] of Object.entries(moduleRegistry)) {
				if (modPath.includes(source.replace(/^\.\//, '').replace(/^\.\.\//, '')) && mod && typeof mod === 'object') {
					const moduleObj = mod as Record<string, any>;
					if (moduleObj[name] !== undefined) return moduleObj[name];
				}
			}
		}
	}

	return undefined;
}

function triggerRebootstrap(g: any, options: AngularUpdateOptions): void {
	const rebootNgModules = g.__reboot_ng_modules__;
	if (typeof rebootNgModules === 'function') {
		if (options.verbose && __NS_ENV_VERBOSE__) {
			console.log('[hmr-angular] falling back to re-bootstrap');
		}
		try {
			g.__NS_DEV_RESET_IN_PROGRESS__ = true;
			rebootNgModules(false);
		} catch (e) {
			if (options.verbose) {
				console.warn('[hmr-angular] re-bootstrap failed', e);
			}
		} finally {
			try {
				g.__NS_DEV_RESET_IN_PROGRESS__ = false;
			} catch {}
		}
	}
}

export function handleAngularHotUpdateMessage(msg: any, options: AngularUpdateOptions): boolean {
	if (!msg || msg.type !== 'ns:angular-update') {
		return false;
	}

	const g: any = globalThis;
	const verbose = options.verbose && __NS_ENV_VERBOSE__;

	try {
		// Extract the changed file path from the message
		const changedPath = msg.path as string | undefined;

		if (verbose) {
			console.log('[hmr-angular] received update for path:', changedPath);
		}

		// Increment the HMR nonce before re-bootstrap so dynamic imports get fresh modules
		try {
			g.__NS_HMR_IMPORT_NONCE__ = (typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
			if (verbose) {
				console.log('[hmr-angular] incremented HMR nonce to:', g.__NS_HMR_IMPORT_NONCE__);
			}
		} catch {}

		// Trigger re-bootstrap
		const rebootNgModules = g.__reboot_ng_modules__;
		if (typeof rebootNgModules === 'function') {
			if (verbose) {
				console.log('[hmr-angular] triggering re-bootstrap via __reboot_ng_modules__');
			}
			try {
				g.__NS_DEV_RESET_IN_PROGRESS__ = true;
				// Pass false to not dispose platform (keep zone.js etc alive)
				rebootNgModules(false);
				if (verbose) {
					console.log('[hmr-angular] re-bootstrap completed');
				}

				// Trigger change detection after re-bootstrap
				// This is especially important for zoneless apps using provideZonelessChangeDetection()
				setTimeout(() => {
					try {
						const appRef = g.__NS_ANGULAR_APP_REF__;
						if (appRef && typeof appRef.tick === 'function') {
							if (verbose) {
								console.log('[hmr-angular] triggering change detection tick');
							}
							appRef.tick();
						}
					} catch (e) {
						if (verbose) {
							console.warn('[hmr-angular] change detection tick failed:', e);
						}
					}
				}, 100);
			} catch (e) {
				console.warn('[hmr-angular] re-bootstrap failed:', e);
			} finally {
				try {
					g.__NS_DEV_RESET_IN_PROGRESS__ = false;
				} catch {}
			}
			return true;
		}

		// Fallback: Try __bootstrap_app_ng_modules__ (just re-bootstrap without dispose)
		const bootstrapNgModules = g.__bootstrap_app_ng_modules__;
		if (typeof bootstrapNgModules === 'function') {
			if (verbose) {
				console.log('[hmr-angular] triggering re-bootstrap via __bootstrap_app_ng_modules__');
			}
			try {
				g.__NS_DEV_RESET_IN_PROGRESS__ = true;
				bootstrapNgModules();
			} catch (e) {
				console.warn('[hmr-angular] bootstrap failed:', e);
			} finally {
				try {
					g.__NS_DEV_RESET_IN_PROGRESS__ = false;
				} catch {}
			}
			return true;
		}

		if (verbose) {
			console.warn('[hmr-angular] No HMR mechanism available. Missing __reboot_ng_modules__ or __bootstrap_app_ng_modules__.');
		}
	} catch (error) {
		console.warn('[hmr-angular] failed to handle update:', error);
	}
	return true;
}
