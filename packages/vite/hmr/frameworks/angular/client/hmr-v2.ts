/**
 * Angular HMR Client Handler for NativeScript (v2)
 *
 * This is a clean, deterministic implementation that handles Angular HMR
 * updates sent from the NativeScript Vite dev server.
 *
 * Key principles:
 * 1. No guessing - the server sends all metadata we need
 * 2. Simple execution - just resolve dependencies and call the function
 * 3. Clear error handling - fail fast with useful diagnostics
 *
 * The server transforms AnalogJS HMR code into a format with:
 * - The update function as default export
 * - Metadata about expected parameters (__nsHmrMetadata__)
 * - Clean ES module syntax
 */

import { getHttpOriginForVite, deriveHttpOrigin, getHMRWsUrl } from '../../../client/utils.js';

declare const __NS_ENV_VERBOSE__: boolean | undefined;

/** Metadata sent from the server about the HMR update */
interface AngularHmrMetadata {
	componentName: string;
	componentPath: string;
	functionName: string;
	parameters: string[];
	namespacesCount: number;
	localDependencies: Array<{
		name: string;
		sourceHint: '@angular/core' | '@nativescript/angular' | '@nativescript/core' | 'component' | 'unknown';
	}>;
	timestamp: number;
}

/** Message format for Angular HMR v2 */
interface AngularHmrV2Message {
	type: 'ns:angular-hmr-v2';
	code: string;
	metadata: AngularHmrMetadata;
}

/** Module resolver function type */
type ModuleResolver = (specifier: string) => any;

/**
 * Resolve a module by its specifier.
 * Uses the vendor registry and native require.
 */
function resolveModule(specifier: string): any {
	const g: any = globalThis;

	// 1. Vendor registry (primary source)
	try {
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (reg && typeof reg.get === 'function') {
			const mod = reg.get(specifier);
			if (mod) return mod;
		}
	} catch {}

	// 2. Native require
	try {
		const req = g.__nsVendorRequire || g.__nsRequire || g.require;
		if (typeof req === 'function') {
			const mod = req(specifier);
			if (mod) return mod;
		}
	} catch {}

	// 3. Native module loader
	try {
		const nativeReq = g.__nativeRequire;
		if (typeof nativeReq === 'function') {
			const mod = nativeReq(specifier, '/');
			if (mod) return mod;
		}
	} catch {}

	return undefined;
}

/**
 * Build the namespaces array for the HMR function.
 *
 * The Angular compiler generates code that accesses namespaces by index:
 * - ɵɵnamespaces[0] = @angular/core (always first)
 * - ɵɵnamespaces[1] = @angular/common (if used)
 * - etc.
 *
 * CRITICAL: We MUST use the ORIGINAL @angular/core module, not a fresh import!
 * The original module has the TRACKED_LVIEWS map with all registered LViews.
 * A fresh import would have an empty map and ɵɵreplaceMetadata wouldn't find any views.
 *
 * @param count Number of namespaces expected
 * @returns Array of resolved namespace modules
 */
function buildNamespacesArray(count: number): any[] {
	const g: any = globalThis;

	// CRITICAL: Use the original Angular core stored during app bootstrap
	// This is set by @nativescript/angular's application.ts
	const originalAngularCore = g.__NS_ANGULAR_CORE__;

	// Standard namespace order based on Angular compiler behavior
	const namespaceModules = ['@angular/core', '@angular/common', '@angular/router', '@angular/forms', '@nativescript/angular'];

	const result: any[] = [];
	for (let i = 0; i < count; i++) {
		if (i === 0) {
			// Always use original Angular core for first namespace
			if (originalAngularCore) {
				result.push(originalAngularCore);
				if (typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__) {
					console.log('[hmr-angular-v2] Using ORIGINAL @angular/core for namespace[0]');
				}
			} else {
				// Fallback to resolved module if original not available
				const mod = resolveModule('@angular/core');
				result.push(mod || {});
				if (typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__) {
					console.warn('[hmr-angular-v2] WARNING: Original @angular/core not found, using fallback');
				}
			}
		} else if (i < namespaceModules.length) {
			const mod = resolveModule(namespaceModules[i]);
			result.push(mod || {});
		} else {
			result.push({});
		}
	}

	return result;
}

/**
 * Find the component class from available registries.
 */
function findComponentClass(name: string): any {
	const g: any = globalThis;

	// 1. Angular components registry
	if (g.__NS_ANGULAR_COMPONENTS__ && g.__NS_ANGULAR_COMPONENTS__[name]) {
		return g.__NS_ANGULAR_COMPONENTS__[name];
	}

	// 2. HMR module registry
	if (g.__NS_HMR_MODULE_REGISTRY__) {
		for (const mod of Object.values(g.__NS_HMR_MODULE_REGISTRY__)) {
			if (mod && typeof mod === 'object') {
				if ((mod as any)[name]) return (mod as any)[name];
				if ((mod as any).default && (mod as any).default[name]) {
					return (mod as any).default[name];
				}
			}
		}
	}

	// 3. Vendor registry - check all modules
	try {
		const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
		if (reg && typeof reg.forEach === 'function') {
			let found: any = undefined;
			reg.forEach((mod) => {
				if (!found && mod && typeof mod === 'object') {
					if (mod[name]) found = mod[name];
					else if (mod.default && mod.default[name]) found = mod.default[name];
				}
			});
			if (found) return found;
		}
	} catch {}

	return undefined;
}

/**
 * Resolve a local dependency by name.
 */
function resolveLocalDependency(dep: { name: string; sourceHint: string }): any {
	// Try the hinted source first
	if (dep.sourceHint !== 'unknown' && dep.sourceHint !== 'component') {
		const mod = resolveModule(dep.sourceHint);
		if (mod && mod[dep.name] !== undefined) {
			return mod[dep.name];
		}
	}

	// Try all known sources
	const sources = ['@angular/core', '@nativescript/angular', '@nativescript/core', '@angular/common', '@angular/forms', '@angular/router'];

	for (const source of sources) {
		const mod = resolveModule(source);
		if (mod && mod[dep.name] !== undefined) {
			return mod[dep.name];
		}
	}

	return undefined;
}

/**
 * Force a view refresh after HMR update.
 * Since Angular's internal LView tracking isn't exposed, we need to manually
 * trigger a view recreation to apply template changes.
 */
async function forceViewRefresh(componentName: string, componentClass: any, verbose: boolean): Promise<boolean> {
	const g: any = globalThis;

	try {
		// Strategy 1: Use NativeScript's Frame navigation to refresh
		const Frame = g.Frame || g.require?.('@nativescript/core')?.Frame;
		if (Frame) {
			const topFrame = Frame.topmost?.();
			if (topFrame && topFrame.currentPage) {
				// Navigate to same page with clearHistory to force refresh
				const currentEntry = topFrame.currentEntry;
				if (currentEntry) {
					if (verbose) {
						console.log('[hmr-angular-v2] Attempting frame refresh via navigate');
					}

					// Use backstackVisible: false and clearHistory to replace current page
					try {
						// Get the module path or component from the entry
						const moduleName = currentEntry.moduleName;
						const create = currentEntry.create;

						if (moduleName || create) {
							topFrame.navigate({
								...currentEntry,
								clearHistory: true,
								backstackVisible: false,
								animated: false,
								transition: { name: 'none', duration: 0 },
							});

							if (verbose) {
								console.log('[hmr-angular-v2] Navigation triggered for refresh');
							}
							return true;
						}
					} catch (navErr) {
						if (verbose) {
							console.warn('[hmr-angular-v2] Navigation refresh failed:', navErr);
						}
					}
				}
			}
		}

		// Strategy 2: Try router navigation (back and forward to same route)
		const router = g.__NS_ANGULAR_ROUTER__;
		if (router && typeof router.navigate === 'function') {
			const currentUrl = router.url;
			if (currentUrl) {
				if (verbose) {
					console.log('[hmr-angular-v2] Attempting router refresh to:', currentUrl);
				}

				// Navigate to same URL with skipLocationChange to avoid history issues
				try {
					await router.navigateByUrl(currentUrl, { skipLocationChange: true, replaceUrl: true });
					if (verbose) {
						console.log('[hmr-angular-v2] Router navigation completed');
					}
					return true;
				} catch (routerErr) {
					if (verbose) {
						console.warn('[hmr-angular-v2] Router refresh failed:', routerErr);
					}
				}
			}
		}

		// Strategy 3: Force page-router-outlet refresh via NativeScript Angular
		const nsAngular = resolveModule('@nativescript/angular');
		if (nsAngular) {
			// Try to find and refresh the page-router-outlet
			const rootView = g.Application?.getRootView?.();
			if (rootView) {
				// Walk the view tree to find and refresh Angular components
				try {
					refreshAngularViews(rootView, componentClass, verbose);
					return true;
				} catch (walkErr) {
					if (verbose) {
						console.warn('[hmr-angular-v2] View tree refresh failed:', walkErr);
					}
				}
			}
		}

		return false;
	} catch (error) {
		if (verbose) {
			console.error('[hmr-angular-v2] forceViewRefresh error:', error);
		}
		return false;
	}
}

/**
 * Walk the NativeScript view tree and try to refresh Angular component views.
 */
function refreshAngularViews(view: any, componentClass: any, verbose: boolean): void {
	if (!view) return;

	// Check if this view is associated with an Angular component
	const ngComponent = view.__ng_component__ || view.ngComponent || (view as any)._ngComponent;
	if (ngComponent && ngComponent.constructor === componentClass) {
		if (verbose) {
			console.log('[hmr-angular-v2] Found matching component instance, attempting refresh');
		}

		// Try to get the change detector and force refresh
		const injector = ngComponent.__injector__ || (ngComponent as any).injector;
		if (injector) {
			try {
				const cdRef = injector.get?.(Symbol.for('ChangeDetectorRef'));
				if (cdRef) {
					cdRef.markForCheck();
					cdRef.detectChanges();
				}
			} catch {}
		}
	}

	// Recursively process children
	if (view.eachChildView) {
		view.eachChildView((child: any) => {
			refreshAngularViews(child, componentClass, verbose);
			return true;
		});
	}
}

/**
 * Execute the HMR update and refresh the view.
 *
 * The HMR update function calls ɵɵreplaceMetadata which:
 * 1. Updates the template function (good)
 * 2. Clears tView to null (problematic for re-bootstrap)
 * 3. Preserves directiveDefs from old definition
 *
 * Since NativeScript doesn't have TRACKED_LVIEWS for in-place view recreation,
 * we need to re-bootstrap. But re-bootstrap needs a valid tView.
 *
 * Solution: After the update, restore critical properties that re-bootstrap needs,
 * while keeping the new template. The new tView will be created during bootstrap.
 */
async function executeHmrUpdate(updateFn: Function, componentClass: any, namespaces: any[], locals: any[], metadata: AngularHmrMetadata, verbose: boolean): Promise<boolean> {
	const g: any = globalThis;

	try {
		const angularCore = namespaces[0];
		const getComponentDef = angularCore?.ɵgetComponentDef || angularCore?.['ɵgetComponentDef'];

		// Get the component definition before update
		let defBefore: any = null;
		let savedTView: any = null;
		let savedDirectiveDefs: any = null;

		if (getComponentDef && componentClass) {
			defBefore = getComponentDef(componentClass);
			// Save properties that ɵɵreplaceMetadata will corrupt
			savedTView = defBefore?.tView;
			savedDirectiveDefs = defBefore?.directiveDefs;

			if (verbose) {
				console.log('[hmr-angular-v2] Component def BEFORE:', {
					id: defBefore?.id,
					type: defBefore?.type?.name,
					hasTView: !!defBefore?.tView,
					templateFn: defBefore?.template?.name || typeof defBefore?.template,
				});
			}
		}

		if (verbose && angularCore) {
			console.log('[hmr-angular-v2] ɵɵreplaceMetadata available:', typeof angularCore.ɵɵreplaceMetadata === 'function');
		}

		// Call the update function with resolved arguments
		// This calls ɵɵreplaceMetadata internally which updates the template
		if (verbose) {
			console.log('[hmr-angular-v2] Calling update function with:', {
				componentClass: componentClass?.name,
				namespacesCount: namespaces.length,
				localsCount: locals.length,
			});
		}

		updateFn(componentClass, namespaces, ...locals);

		if (verbose) {
			console.log('[hmr-angular-v2] Update function executed successfully');
		}

		// Get the definition after update to capture the new template
		let defAfter: any = null;
		let newTemplate: any = null;

		if (getComponentDef && componentClass) {
			defAfter = getComponentDef(componentClass);
			newTemplate = defAfter?.template;

			if (verbose) {
				console.log('[hmr-angular-v2] Component def AFTER (before fix):', {
					id: defAfter?.id,
					type: defAfter?.type?.name,
					hasTView: !!defAfter?.tView,
					templateFn: defAfter?.template?.name || typeof defAfter?.template,
					templateChanged: defBefore?.template !== defAfter?.template,
				});
			}

			// CRITICAL FIX: ɵɵreplaceMetadata clears tView which breaks re-bootstrap.
			// We need to keep the new template but restore tView so the component
			// can be properly instantiated during re-bootstrap.
			//
			// The tView will be recreated with the new template when the component
			// is first instantiated after re-bootstrap.
			if (defAfter && savedTView && !defAfter.tView) {
				// Instead of restoring the old tView (which has old template refs),
				// we leave tView as null. Angular will create a fresh tView on
				// first component instantiation using the new template.
				//
				// BUT: We need to ensure directiveDefs is still valid for the
				// initial setup. The issue is directiveDefs may contain stale refs.

				if (verbose) {
					console.log('[hmr-angular-v2] tView was cleared by ɵɵreplaceMetadata (expected)');
					console.log('[hmr-angular-v2] directiveDefs preserved:', !!defAfter.directiveDefs);
				}
			}
		}

		// Skip Angular change detection - we're going to re-bootstrap anyway
		// and the old app instance will be destroyed

		// Re-bootstrap the Angular app
		// The component class now has the updated template function.
		// A fresh tView will be created during bootstrap.
		if (verbose) {
			console.log('[hmr-angular-v2] Triggering re-bootstrap to apply new template...');
		}

		// IMPORTANT: We need to clear directiveDefs to force Angular to
		// re-resolve them during the new bootstrap. The old directiveDefs
		// may contain references to component types that are now stale.
		if (defAfter) {
			// Reset directiveDefs to null - Angular will re-resolve them
			// from the component's imports during the next bootstrap
			defAfter.directiveDefs = null;
			defAfter.pipeDefs = null;

			if (verbose) {
				console.log('[hmr-angular-v2] Cleared directiveDefs and pipeDefs for fresh resolution');
			}
		}

		triggerRebootstrap(verbose);

		// Request native layout update
		try {
			const rootView = g.Application?.getRootView?.();
			if (rootView && typeof rootView.requestLayout === 'function') {
				rootView.requestLayout();
			}
		} catch {}

		return true;
	} catch (error) {
		console.error('[hmr-angular-v2] Update function failed:', error);
		return false;
	}
}

/**
 * Handle Angular HMR v2 message from the server.
 *
 * This is the main entry point for processing HMR updates.
 *
 * The approach:
 * 1. Execute the HMR update function (from AnalogJS) to update the component's template
 * 2. Re-bootstrap the Angular app to recreate views with the updated template
 *
 * The HMR code from AnalogJS calls ɵɵreplaceMetadata which updates the component
 * definition in-place. Then re-bootstrap creates new component instances that
 * use the updated definition.
 */
export async function handleAngularHmrV2(msg: AngularHmrV2Message, options: { getCore?: ModuleResolver; verbose?: boolean } = {}): Promise<boolean> {
	const g: any = globalThis;
	const verbose = options.verbose ?? (typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__);

	if (!msg || msg.type !== 'ns:angular-hmr-v2') {
		return false;
	}

	const { code, metadata } = msg;

	if (!code || !metadata) {
		if (verbose) {
			console.warn('[hmr-angular-v2] Missing code or metadata');
		}
		return false;
	}

	if (verbose) {
		console.log('[hmr-angular-v2] Processing HMR update for:', metadata.componentName);
		console.log('[hmr-angular-v2] Component path:', metadata.componentPath);
		console.log('[hmr-angular-v2] HMR code length:', code.length);
	}

	try {
		// Step 1: Execute the HMR code to get the update function
		// We use Blob + URL.createObjectURL to execute the ES module code
		let updateFn: Function | undefined;

		try {
			const blob = new Blob([code], { type: 'application/javascript' });
			const blobUrl = URL.createObjectURL(blob);

			if (verbose) {
				console.log('[hmr-angular-v2] Importing HMR module from blob...');
			}

			const hmrModule = await import(/* @vite-ignore */ blobUrl);

			// Revoke the blob URL after import
			try {
				URL.revokeObjectURL(blobUrl);
			} catch {}

			// Get the update function
			updateFn = hmrModule.default || hmrModule[metadata.functionName];

			if (verbose) {
				console.log('[hmr-angular-v2] HMR module loaded, exports:', Object.keys(hmrModule));
				console.log('[hmr-angular-v2] Update function:', typeof updateFn);
			}
		} catch (blobErr) {
			if (verbose) {
				console.error('[hmr-angular-v2] Failed to load HMR module via blob:', blobErr);
			}
			// Fallback: try direct eval (less safe but may work)
			try {
				const evalCode = code.replace(/export\s+default\s+function/, 'var __hmrUpdateFn__ = function');
				eval(evalCode);
				updateFn = (globalThis as any).__hmrUpdateFn__;
				delete (globalThis as any).__hmrUpdateFn__;
			} catch (evalErr) {
				if (verbose) {
					console.error('[hmr-angular-v2] Eval fallback also failed:', evalErr);
				}
			}
		}

		if (typeof updateFn !== 'function') {
			if (verbose) {
				console.warn('[hmr-angular-v2] No update function found, falling back to re-bootstrap only');
			}
			triggerRebootstrap(verbose);
			return true;
		}

		// Step 2: Resolve dependencies for the update function

		// Find the component class
		const componentClass = findComponentClass(metadata.componentName);
		if (!componentClass) {
			if (verbose) {
				console.warn('[hmr-angular-v2] Component class not found:', metadata.componentName);
				console.log('[hmr-angular-v2] Available in registry:', Object.keys(g.__NS_ANGULAR_COMPONENTS__ || {}));
			}
			triggerRebootstrap(verbose);
			return true;
		}

		if (verbose) {
			console.log('[hmr-angular-v2] Found component class:', componentClass.name);
		}

		// Build namespaces array
		const namespaces = buildNamespacesArray(metadata.namespacesCount);

		if (verbose) {
			console.log('[hmr-angular-v2] Built namespaces array, count:', namespaces.length);
			console.log('[hmr-angular-v2] namespace[0] is original Angular core:', namespaces[0] === g.__NS_ANGULAR_CORE__);
		}

		// Resolve local dependencies
		const locals: any[] = [];
		for (const dep of metadata.localDependencies) {
			const resolved = resolveLocalDependency(dep);
			if (resolved === undefined && verbose) {
				console.warn('[hmr-angular-v2] Could not resolve local dependency:', dep.name);
			}
			locals.push(resolved);
		}

		if (verbose) {
			console.log(
				'[hmr-angular-v2] Resolved locals:',
				metadata.localDependencies.map((d) => d.name),
			);
		}

		// Step 3: Execute the HMR update
		const success = await executeHmrUpdate(updateFn, componentClass, namespaces, locals, metadata, verbose);

		if (verbose) {
			console.log('[hmr-angular-v2] executeHmrUpdate returned:', success);
		}

		return success;
	} catch (error) {
		if (verbose) {
			console.error('[hmr-angular-v2] Error during HMR update:', error);
		}
		// Fall back to re-bootstrap
		triggerRebootstrap(verbose);
		return true;
	}
}

/**
 * Trigger a full app re-bootstrap.
 * This is the reliable way to handle Angular HMR - same as webpack HMR.
 * Uses the __reboot_ng_modules__ function exposed by @nativescript/angular.
 */
function triggerRebootstrap(verbose: boolean): void {
	const g: any = globalThis;

	if (verbose) {
		console.log('[hmr-angular-v2] Triggering re-bootstrap via __reboot_ng_modules__...');
	}

	try {
		// Primary method: Use the reboot function from @nativescript/angular
		if (typeof g.__reboot_ng_modules__ === 'function') {
			if (verbose) {
				console.log('[hmr-angular-v2] Calling __reboot_ng_modules__()');
			}
			g.__reboot_ng_modules__(false); // false = don't dispose platform
			return;
		}

		// Fallback: Try individual dispose and bootstrap
		if (typeof g.__dispose_app_ng_modules__ === 'function' && typeof g.__bootstrap_app_ng_modules__ === 'function') {
			if (verbose) {
				console.log('[hmr-angular-v2] Calling __dispose_app_ng_modules__ + __bootstrap_app_ng_modules__');
			}
			g.__dispose_app_ng_modules__();
			g.__bootstrap_app_ng_modules__();
			return;
		}

		// Last resort: Just tick the app ref
		if (verbose) {
			console.warn('[hmr-angular-v2] No reboot function found, falling back to tick()');
		}
		if (g.__NS_ANGULAR_APP_REF__ && typeof g.__NS_ANGULAR_APP_REF__.tick === 'function') {
			g.__NS_ANGULAR_APP_REF__.tick();
		}
	} catch (error) {
		console.error('[hmr-angular-v2] Re-bootstrap failed:', error);
	}
}

/**
 * Check if a message is an Angular HMR v2 message.
 */
export function isAngularHmrV2Message(msg: any): msg is AngularHmrV2Message {
	return msg && msg.type === 'ns:angular-hmr-v2';
}
