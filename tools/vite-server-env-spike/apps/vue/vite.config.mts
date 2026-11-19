import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { vueConfig } from '@nativescript/vite/vue';

export default defineConfig(({ mode }): UserConfig => mergeConfig(vueConfig({ mode }), {}));
