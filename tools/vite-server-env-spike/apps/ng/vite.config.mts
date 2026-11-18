import { defineConfig, mergeConfig, UserConfig } from 'vite';
import { angularConfig } from '@nativescript/vite/angular';

export default defineConfig(({ mode }): UserConfig => mergeConfig(angularConfig({ mode }), {}));
