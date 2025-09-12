export class CompatDefinePlugin {
	private readonly definitions: Record<string, any>;

	constructor(definitions: Record<string, any>) {
		this.definitions = definitions || {};
	}

	apply(compiler: any) {
		// Use the same webpack instance as the compiler to avoid version mismatches
		const wp = compiler?.webpack || require('webpack');
		const DefinePlugin = wp.DefinePlugin || require('webpack').DefinePlugin;
		new DefinePlugin(this.definitions).apply(compiler);
	}
}
