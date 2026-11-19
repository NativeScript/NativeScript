import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { angularConfig } from '@nativescript/vite/angular';
import { requestTimingPlugin } from '../../request-timing-plugin.mjs';

export default defineConfig(({ mode }): UserConfig => mergeConfig(angularConfig({ mode }), { plugins: requestTimingPlugin() }));
