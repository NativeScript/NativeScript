import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { vueConfig } from '@nativescript/vite/vue';
import { requestTimingPlugin } from '../../request-timing-plugin.mjs';

export default defineConfig(({ mode }): UserConfig => mergeConfig(vueConfig({ mode }), { plugins: requestTimingPlugin() }));
