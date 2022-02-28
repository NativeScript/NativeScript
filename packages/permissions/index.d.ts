import type { PermissionStatus } from './common';
export * from './common';
export type PermissionsType = 'location' | 'camera' | 'microphone' | 'photo' | 'contacts' | 'event' | 'reminder' | 'bluetooth' | 'bluetoothConnect' | 'bluetoothScan' | 'notification' | 'backgroundRefresh' | 'speechRecognition' | 'mediaLocation' | 'mediaLibrary' | 'motion' | 'storage' | 'callPhone' | 'readSms' | 'receiveSms';
export interface PermissionRationale {
	title: string;
	message: string;
	buttonPositive?: string;
	buttonNegative?: string;
	buttonNeutral?: string;
}
export type PermissionCheckOptions = string | { type: string };
export type PermissionRequestOptions = string | { type: string; rationale?: PermissionRationale };
export type PermissionResult<T> = T extends any[] ? { [k: string]: PermissionStatus } : [PermissionStatus, boolean];

export class Permissions {
	static canOpenSettings(): Promise<boolean>;
	static openSettings(): Promise<boolean>;
	static getTypes(): Permissions[];
	static check<T = Permissions>(permission: T, options?: PermissionCheckOptions): Promise<PermissionResult<T>>;
	static request<T = Permissions | Permissions[] | string[]>(permission: T, options?: PermissionRequestOptions): Promise<PermissionResult<T>>;
	static checkMultiple<T = Permissions[]>(permissions: T): Promise<PermissionResult<T>>;
}
