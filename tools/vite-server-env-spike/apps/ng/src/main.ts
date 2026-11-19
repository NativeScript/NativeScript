import '@nativescript/vite/hmr-compat';
import { bootstrapApplication, provideNativeScriptHmrCompat, provideNativeScriptHttpClient, provideNativeScriptRouter, runNativeScriptAngularApp } from '@nativescript/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { InfoDialogComponent } from './app/home/info-dialog.component';

// Exercises the deprecated globals of the compat layer; each warns once per process.
const g = globalThis as any;
g.__NS_HMR_ON_UPDATE__ = (update: { version: number; changedIds: string[] }) => console.log(`[spike-ng] __NS_HMR_ON_UPDATE__ #${update.version}: ${update.changedIds.join(', ')}`);
const logAfterReboot = () => console.log(`[spike-ng] afterReboot; __NS_NG_HMR__.route.restoring = ${g.__NS_NG_HMR__?.route.restoring}`);
g.__NS_HOT_REGISTRY__?.on('nativescript:afterReboot', logAfterReboot);
(import.meta as any).hot?.on('nativescript:beforeRerun', () => g.__NS_HOT_REGISTRY__?.off('nativescript:afterReboot', logAfterReboot));

runNativeScriptAngularApp({
	appModuleBootstrap: () => {
		return bootstrapApplication(AppComponent, {
			providers: [provideNativeScriptHttpClient(withInterceptorsFromDi()), provideNativeScriptRouter(routes), provideZonelessChangeDetection(), provideNativeScriptHmrCompat({ dialogComponents: [InfoDialogComponent] })],
		});
	},
});
