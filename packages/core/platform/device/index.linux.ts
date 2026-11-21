import { outPointer } from '../../utils/gtk.linux';
import { Screen } from '../screen';

const MIN_TABLET_PIXELS = 600;

function readFile(path: string): string | null {
	const contents = outPointer();
	if (!g_file_get_contents(path, contents, null, null)) {
		return null;
	}
	const text = interop.stringFromCString(contents.value);
	g_free(contents.value);
	return text;
}

function osRelease(): Record<string, string> {
	const result: Record<string, string> = {};
	for (const line of (readFile('/etc/os-release') ?? '').split('\n')) {
		const match = /^([A-Z_]+)=(.*)$/.exec(line);
		if (match) {
			result[match[1]] = match[2].replace(/^"|"$/g, '');
		}
	}
	return result;
}

class DeviceRef {
	private _release: Record<string, string>;
	private _uuid: string;

	private get release() {
		return (this._release ??= osRelease());
	}

	get manufacturer(): string {
		return (readFile('/sys/class/dmi/id/sys_vendor') ?? '').trim() || 'Linux';
	}

	get os(): string {
		return 'Linux';
	}

	/** Distribution version, e.g. "24.04". */
	get osVersion(): string {
		return this.release.VERSION_ID ?? 'unknown';
	}

	get model(): string {
		return (readFile('/sys/class/dmi/id/product_name') ?? '').trim() || this.release.PRETTY_NAME || 'Linux PC';
	}

	get sdkVersion(): string {
		return this.osVersion;
	}

	get deviceType(): 'Phone' | 'Tablet' {
		const dips = Math.min(Screen.mainScreen.widthDIPs, Screen.mainScreen.heightDIPs);
		return dips >= MIN_TABLET_PIXELS ? 'Tablet' : 'Phone';
	}

	get uuid(): string {
		return (this._uuid ??= (readFile('/etc/machine-id') ?? '').trim() || crypto.randomUUID().replace(/-/g, ''));
	}

	private get locale(): string {
		const names = g_get_language_names();
		const first: any = names && new interop.Reference((interop.types as any).pointer, names).value;
		return (first && interop.stringFromCString(first)) || 'en';
	}

	get language(): string {
		const lang = this.locale.split(/[._@]/)[0];
		return lang === 'C' || lang === 'POSIX' ? 'en' : lang.replace('_', '-');
	}

	get region(): string {
		return this.locale.split(/[._@]/)[1] ?? 'US';
	}
}

export const Device = new DeviceRef();

export const device = Device;
