import base from './base';

import angular from './angular';
import javascript from './javascript';
import react from './react';
import svelte from './svelte';
import typescript from './typescript';
import vue from './vue';

// export chain configs
// todo: rename if needed
export { base as __base, angular as __angular, javascript as __javascript, react as __react, svelte as __svelte, typescript as __typescript, vue as __vue };

// export final configs
export const baseConfig = (env: IWebpackEnv) => base(env).toConfig();

export const angularConfig = (env: IWebpackEnv) => angular(env).toConfig();
export const javascriptConfig = (env: IWebpackEnv) => javascript(env).toConfig();
export const reactConfig = (env: IWebpackEnv) => react(env).toConfig();
export const svelteConfig = (env: IWebpackEnv) => svelte(env).toConfig();
export const typescriptConfig = (env: IWebpackEnv) => typescript(env).toConfig();
export const vueConfig = (env: IWebpackEnv) => vue(env).toConfig();

export interface IWebpackEnv {
	[name: string]: any;

	appPath?: string;
	appResourcesPath?: string;

	android?: boolean;
	ios?: boolean;

	production?: boolean;
	report?: boolean;
	hmr?: boolean;
	// todo: add others
}

export enum WebpackPlatform {
	'ios',
	'android',
}
