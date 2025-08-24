import { extname, resolve } from 'path';
import { existsSync } from 'fs';

const id = 'PlatformSuffixPlugin';

interface PlatformSuffixPluginOptions {
	extensions: Array<string>;
}

/**
 * The platform suffix plugin will try to resolve files with a platform specifier (suffix)
 * falling back to the non-platform-specific version.
 *
 * For example:
 *   import something from './something.js'
 *
 *   will first look for './something.<platform>.js'
 *   and if not found look for './something.js'
 *
 */
export class PlatformSuffixPlugin {
	private readonly extensions: string[];

	constructor(options: PlatformSuffixPluginOptions) {
		this.extensions = options.extensions;

		// if (typeof options.extensions === "function") {
		// 	this.extensions = options.extensions()
		// } else {
		// 	this.extensions = options.extensions
		// }
	}

	apply(compiler: any) {
		const platformRE = new RegExp(`\\.${this.extensions.join('|')}\\.`);

		// require.context
		compiler.hooks.contextModuleFactory.tap(id, (cmf) => {
			// @ts-ignore
			const altHook = (cmf as any).hooks?.alternativeRequests;
			if (altHook && typeof altHook.tap === 'function') {
				altHook.tap(id, (modules: any[], options: any) => {
					const additionalModules = [];
					// we are looking for modules that are platform specific (something.<platform>.ext)
					// and we are duplicating them without the platform suffix
					// this allows using require.context with non-existent platformless filenames
					// but mapped to the platform specific variant (done in the resolver hook below)
					for (const module of modules) {
						if (platformRE.test(module.request)) {
							additionalModules.push({
								...module,
								request: module.request.replace(platformRE, '.'),
							});
						}
					}
					modules.push(...additionalModules);
				});
			} else {
				// Hook may be absent on some webpack versions; skip gracefully
				// console.log(`[${id}] alternativeRequests hook not available; skipping.`)
			}
		});

		compiler.resolverFactory.hooks.resolver
			.for('normal')
			.tap(id, (resolver) => {
				// Object.keys(resolver.hooks).forEach(hook => {
				// 	resolver.hooks[hook].tap(id, (request, resolveContext) => {
				// 		if(
				// 			request?.path?.includes('foo.xml') ||
				// 			request?.request?.includes('foo.xml')
				// 		) {
				// 			console.log(
				// 				`>>> ${hook}: ${request.path}`,
				// 				// request
				// 			)
				// 		}
				// 		// callback();
				// 	});
				// })

				const normalResolveHook = (resolver as any).hooks?.normalResolve;
				const ensureHook = (name: string) => {
					return typeof (resolver as any).ensureHook === 'function'
						? (resolver as any).ensureHook(name)
						: (resolver as any).hooks?.[name];
				};

				if (
					!normalResolveHook ||
					typeof normalResolveHook.tapAsync !== 'function'
				) {
					// Missing or incompatible hook; skip to avoid crashes
					return;
				}

				normalResolveHook.tapAsync(id, (request_, resolveContext, callback) => {
					for (const platform of this.extensions) {
						const { path, request } = request_;
						const ext = request && extname(request);
						const platformExt = ext ? `.${platform}${ext}` : '';

						if (path && request && ext && !request.includes(platformExt)) {
							const platformRequest = request.replace(ext, platformExt);
							const extPath = resolve(path, platformRequest);

							// console.log({
							// 	path,
							// 	request,
							// 	ext,
							// 	extPath
							// })

							// if a file with the same + a platform suffix exists
							// we want to resolve that file instead
							if (existsSync(extPath)) {
								const message = `resolving "${request}" to "${platformRequest}"`;
								const hook = ensureHook('normalResolve');

								// here we are creating a new resolve object and replacing the path
								// with the .<platform>.<ext> suffix
								const obj = {
									...request_,
									path: resolver.join(path, platformRequest),
									relativePath:
										request_.relativePath &&
										resolver.join(request_.relativePath, platformRequest),
									request: undefined,
								};

								// we call to the actual resolver to do the resolving of this new file
								return (resolver as any).doResolve(
									hook as any,
									obj,
									message,
									resolveContext,
									callback,
								);
							}
						}
					}
					callback();
				});
				// 	resolver.hooks.rawFile.tap(id, (request, resolveContext, callback) => {
				// 		if(request.path && !/\.ios\..+$/.test(request.path)) {
				// 			const { ext } = parse(request.path)
				// 			const platformExtPath = request.path.replace(ext, `.${this.platform}${ext}`)
				// 			// console.log({
				// 			//     p1: request.path,
				// 			//     p2: platformExtPath
				// 			// })
				// 			if(existsSync(platformExtPath)) {
				// 				// request.path = platformExtPath
				// 				// console.log('-'.repeat(100))
				// 				// console.log(request)
				// 				const obj = {
				// 					...request,
				// 					path: platformExtPath,
				// 					fullySpecified: false
				// 				}
				// 				return resolver.doResolve(
				// 					'raw-file',
				// 					obj,
				// 					`resolved ${request.path} to platform specific file: ${platformExtPath}`,
				// 					resolveContext,
				// 					(err, result) => {
				// 						if(err) return callback(err);
				// 						if(result) return callback(null, result);
				// 						return callback();
				// 					}
				// 				)
				// 				// return request
				// 			}
				// 		}
				// });
			});
	}
}
