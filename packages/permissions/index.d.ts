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
export type PermissionCheckOptions = { type: 'always' | 'none' | null | undefined };
export type PermissionRequestOptions = PermissionCheckOptions & { rationale?: PermissionRationale };
export type PermissionResult = { [k: PermissionsType]: { status: PermissionStatus; nativePermission: Array<string> } };

export class Permissions {
	static canOpenSettings(): Promise<boolean>;
	static openSettings(): Promise<boolean>;
	static getTypes(): Array<PermissionsType>;
	static check(permission: Array<PermissionsType> | PermissionsType, options?: PermissionCheckOptions): Promise<PermissionResult>;
	static request(permission: Array<PermissionsType> | PermissionsType, options?: PermissionRequestOptions): Promise<PermissionResult>;
}
