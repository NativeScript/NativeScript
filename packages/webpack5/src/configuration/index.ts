import base from './base';

import angular from './angular';
import javascript from './javascript';
import react from './react';
import svelte from './svelte';
import typescript from './typescript';
import vue from './vue';

// export final configs
// todo: perhaps we can export chain configs as well

export const baseConfig = (env) => base(env).toConfig();

export const angularConfig = (env) => angular(env).toConfig();
export const javascriptConfig = (env) => javascript(env).toConfig();
export const reactConfig = (env) => react(env).toConfig();
export const svelteConfig = (env) => svelte(env).toConfig();
export const typescriptConfig = (env) => typescript(env).toConfig();
export const vueConfig = (env) => vue(env).toConfig();

export interface IWebpackEnv {
	hmr: boolean;
	// todo: add others
}
