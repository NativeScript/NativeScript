// Root placeholder installer used during dev HMR until HTTP ESM loads.
export function installRootPlaceholder(verbose?: boolean) {
	const g: any = globalThis as any;
	if (g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__']) return;
	g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'] = true;
	try {
		const getCore = (name: string): any => {
			try {
				const reg = g.__nsVendorRegistry;
				const req = reg?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
				let mod: any = null;
				if (reg && reg.has('@nativescript/core')) mod = reg.get('@nativescript/core');
				else if (typeof req === 'function') {
					try {
						mod = req('@nativescript/core');
					} catch {}
				}
				const ns = (mod && (mod.default ?? mod)) || mod;
				if (name === 'Application' && ns && (ns.Application || ns)) return ns.Application || ns;
				if (ns && ns[name]) return ns[name];
			} catch {}
			try {
				const nr = g.__nativeRequire;
				if (typeof nr === 'function') {
					try {
						const mod = nr('@nativescript/core', '/');
						const ns = (mod && (mod.default ?? mod)) || mod;
						if (name === 'Application' && ns && (ns.Application || ns)) return ns.Application || ns;
						if (ns && ns[name]) return ns[name];
					} catch {}
				}
			} catch {}
			return undefined;
		};
		const Application = getCore('Application');
		const Frame = getCore('Frame');
		const Page = getCore('Page');
		const Label = getCore('Label');
		if (!Application || !Frame || !Page || !Label) {
			try {
				console.warn('[ns-entry] (early) core classes unavailable for placeholder');
			} catch {}
		}
		const __ns_launch_handler = (args?: any) => {
			try {
				const prev = args?.root;
				if (verbose) console.info('[ns-entry] (early) launchEvent fired; existing root:', !!prev);
				if (!prev && Frame && Page && Label) {
					const page = new Page();
					page.actionBarHidden = true;
					const label = new Label();
					label.text = 'Starting NativeScript + Vite dev server…';
					label.textAlignment = 'center';
					label.padding = 12;
					page.content = label;
					const frame = new Frame();
					frame.navigate({ create: () => page, clearHistory: true, animated: false });
					try {
						(frame as any).__ns_dev_placeholder = true;
						(page as any).__ns_dev_placeholder = true;
						g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'] = frame;
					} catch {}
					if (args) args.root = frame;
					if (verbose) console.info('[ns-entry] (early) temporary root provided via launch args');
				}
			} catch (e) {
				try {
					console.error('[ns-entry] (early) temp root error', e);
				} catch {}
			}
		};
		try {
			g['__NS_DEV_LAUNCH_HANDLER__'] = __ns_launch_handler;
		} catch {}
		try {
			if (!g['__NS_DEV_LAUNCH_ATTACHED__'] && Application && (Application as any).on) {
				(Application as any).on((Application as any).launchEvent, __ns_launch_handler);
				g['__NS_DEV_LAUNCH_ATTACHED__'] = true;
			}
		} catch {}
		try {
			g['__NS_DEV_RESTORE_PLACEHOLDER__'] = () => {
				try {
					if (g['__NS_DEV_LAUNCH_HANDLER__'] && Application && (Application as any).off) {
						(Application as any).off((Application as any).launchEvent, g['__NS_DEV_LAUNCH_HANDLER__']);
					}
				} catch {}
				// Clear flags and drop any retained placeholder Frame reference
				try {
					delete g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'];
				} catch {}
				try {
					delete g['__NS_DEV_LAUNCH_ATTACHED__'];
				} catch {}
				try {
					const fr = g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'];
					if (fr && typeof fr._removeFromSuperview === 'function') {
						try {
							fr._removeFromSuperview();
						} catch {}
					}
				} catch {}
				try {
					delete g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'];
				} catch {}
			};
		} catch {}
	} catch (e) {
		try {
			console.error('[ns-entry] (early) failed to install launchEvent handler', e);
		} catch {}
	}
}
