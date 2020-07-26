import { Observable } from '../data/observable';
export declare class NativeScriptGlobalState {
	events: Observable<any>;
	launched: boolean;
}
export function installPolyfills(moduleName: string, exportNames: string[]): void;
export function initGlobal(): void;
