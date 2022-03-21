import { relative } from 'path';
import dedent from 'ts-dedent';
import { includeHmrInRuntime } from './hmr-runtime';

// note: this will bail even if module.hot appears in a comment
const MODULE_HOT_RE = /module\.hot/;

export default function loader(content: string, map: any) {
	if (MODULE_HOT_RE.test(content)) {
		// Code already handles HMR - we don't need to do anything
		return this.callback(null, content, map);
	}

	const opts = this.getOptions();

	// used to inject the HMR runtime into the entry file
	if (opts.injectHMRRuntime) {
		return this.callback(
			null,
			`${content}\n${includeHmrInRuntime.toString()}\nincludeHmrInRuntime()`,
			map
		);
	}

	const relativePath = relative(
		opts.appPath ?? this.rootContext,
		this.resourcePath
	).replace(/\\/g, '/');
	const hmrCode = this.hot
		? dedent`
			/* NATIVESCRIPT-HOT-LOADER */
			if(module.hot && global._isModuleLoadedForUI && global._isModuleLoadedForUI("./${relativePath}")) {
				module.hot.accept()
			}
		`
		: ``;

	const source = `${content}\n${hmrCode}`;

	this.callback(null, source, map);
}
