import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { typescriptConfig } from '@nativescript/vite';

export default defineConfig(({ mode }): UserConfig => {
	return mergeConfig(typescriptConfig({ mode }), {});
});
