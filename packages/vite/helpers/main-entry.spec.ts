import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The boot code names the app's main entry; cwd may be the workspace root.
vi.mock('./project.js', async (importOriginal) => ({ ...(await importOriginal<typeof import('./project.js')>()), getPackageJson: () => ({ main: 'src/app.ts' }) }));

import { generateDevBootCode, isStrictGlobalRequireEnabled } from './main-entry.js';

const STRICT_IMPORT = "import '@nativescript/vite/runtime/strict-global-require.js';";

afterEach(() => {
	delete process.env.NS_VITE_STRICT_REQUIRE;
	delete process.env.NS_APP_COMPONENTS;
});

describe('strict global require flag', () => {
	it('is on unless NS_VITE_STRICT_REQUIRE is a falsy spelling', () => {
		expect(isStrictGlobalRequireEnabled({})).toBe(true);
		for (const value of ['1', 'true', '']) expect(isStrictGlobalRequireEnabled({ NS_VITE_STRICT_REQUIRE: value })).toBe(true);
		for (const value of ['0', 'false', 'OFF', ' no ']) expect(isStrictGlobalRequireEnabled({ NS_VITE_STRICT_REQUIRE: value })).toBe(false);
	});

	it.each(['ios', 'android', 'visionos'] as const)('makes the shadow the first import of the %s dev boot module by default', (platform) => {
		const opts = { platform, verbose: false, flavor: 'typescript' };
		const code = generateDevBootCode(opts);
		expect(code.split('\n').find((line) => line.startsWith('import '))).toBe(STRICT_IMPORT);
		process.env.NS_VITE_STRICT_REQUIRE = '0';
		expect(generateDevBootCode(opts)).not.toContain(STRICT_IMPORT);
	});
});

describe('dev boot module', () => {
	it('awaits the session and exports its failure for bundle.mjs, with no placeholder', () => {
		const code = generateDevBootCode({ platform: 'ios', verbose: false, flavor: 'typescript' });
		expect(code).toContain('export const bootFailure = await startBrowserRuntimeSession({"sessionUrl":"/__ns_dev__/session.mjs","importMapUrl":"/__ns_dev__/import-map.mjs"}, __nsVerboseLog);');
		expect(code).not.toMatch(/placeholder/i);
	});
});

describe('Android dev boot module', () => {
	const ACTIVITY_IMPORT = 'import "@nativescript/core/ui/frame/activity.android";';

	it("imports core's activity statically, ahead of the app entry, instead of deferring it", () => {
		const code = generateDevBootCode({ platform: 'android', verbose: false, flavor: 'typescript' });
		const lines = code.split('\n');
		expect(lines).toContain(ACTIVITY_IMPORT);
		expect(lines.indexOf(ACTIVITY_IMPORT)).toBeLessThan(lines.findIndex((line) => line.includes('startBrowserRuntimeSession(')));
		expect(code).not.toContain('__nsDeferAndroidActivityImport');
		expect(generateDevBootCode({ platform: 'ios', verbose: false, flavor: 'typescript' })).not.toContain('activity.android');
	});

	it('imports the served app components before it, leaving a custom Application to its on-disk build', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-app-components-'));
		const activity = path.join(dir, 'custom-activity.android.ts');
		const application = path.join(dir, 'custom-application.android.ts');
		fs.writeFileSync(activity, "@NativeClass()\n@JavaProxy('org.example.MainActivity')\nclass MainActivity extends androidx.appcompat.app.AppCompatActivity {}\n");
		fs.writeFileSync(application, "@NativeClass()\n@JavaProxy('org.example.Application')\nclass Application extends android.app.Application {}\n");
		process.env.NS_APP_COMPONENTS = `${activity},${application}`;
		try {
			const lines = generateDevBootCode({ platform: 'android', verbose: false, flavor: 'typescript' }).split('\n');
			const activityLine = lines.findIndex((line) => line.startsWith('import ') && line.includes('custom-activity.android.ts'));
			expect(activityLine).toBeGreaterThan(-1);
			expect(activityLine).toBeLessThan(lines.indexOf(ACTIVITY_IMPORT));
			expect(lines.some((line) => line.includes('custom-application'))).toBe(false);
		} finally {
			fs.rmSync(dir, { recursive: true, force: true });
		}
	});
});
