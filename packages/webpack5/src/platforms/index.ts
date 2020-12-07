import { error } from "../helpers/log";
import { env, Platform } from "../";

import AndroidPlatform from "./android";
import iOSPlatform from "./ios";

export interface INativeScriptPlatform {
	getEntryPath?(): string;
	getDistPath?(): string
}

const platforms = {
	android: AndroidPlatform,
	ios: iOSPlatform,
}

export function addPlatform(name: string, platform: INativeScriptPlatform) {
	console.log('adding platform', name, platform)
	platforms[name] = platform;
}

export function getPlatform(): INativeScriptPlatform {
	return platforms[getPlatformName()]
}

export function getPlatformName(): Platform {
	if (env?.android) {
		return 'android';
	}

	if (env?.ios) {
		return 'ios';
	}

	// support custom platforms
	if(env?.platform) {
		return env.platform;
	}

	throw error(`
		You need to provide a target platform!

		Available platforms: ${Object.keys(platforms).join(', ')}

		Use --env=platform=<platform> or --env=android, --env=ios to specify the target platform.
	`);
}
