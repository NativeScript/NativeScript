import fs from 'fs';
import path from 'path';
import { createRequire } from 'node:module';
import { determineProjectFlavor } from './flavor.js';
import { getProjectFilePath, getProjectRootPath } from './project.js';

const require = createRequire(import.meta.url);

interface PackageJson {
	name?: string;
	version?: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	scripts?: Record<string, string>;
	[key: string]: any;
}

const DEV_DEPS = {
	concurrently: '^9.0.0',
	'wait-on': '^9.0.0',
} as const;

const RUNTIME_DEPS = {
	'@valor/nativescript-websockets': '^2.0.2',
} as const;

function readPackageJson(): PackageJson {
	const pkgPath = getProjectFilePath('package.json');
	const raw = fs.readFileSync(pkgPath, 'utf8');
	return JSON.parse(raw) as PackageJson;
}

function writePackageJson(pkg: PackageJson) {
	const pkgPath = getProjectFilePath('package.json');
	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

function ensureDependencies(pkg: PackageJson) {
	pkg.dependencies = pkg.dependencies ?? {};
	pkg.devDependencies = pkg.devDependencies ?? {};

	for (const [name, version] of Object.entries(DEV_DEPS)) {
		pkg.devDependencies[name] = version;
	}

	for (const [name, version] of Object.entries(RUNTIME_DEPS)) {
		pkg.dependencies[name] = version;
	}
}

function ensureScripts(pkg: PackageJson) {
	pkg.scripts = pkg.scripts ?? {};
	pkg.scripts['dev:ios'] = "concurrently -k -n vite,ns 'npm run dev:server:ios' 'wait-on tcp:5173 && npm run ios'";
	pkg.scripts['dev:android'] = "concurrently -k -n vite,ns 'npm run dev:server:android' 'wait-on tcp:5173 && npm run android'";
	pkg.scripts['dev:server:ios'] = 'VITE_DEBUG_LOGS=1 vite serve -- --env.ios --env.hmr';
	pkg.scripts['dev:server:android'] = 'VITE_DEBUG_LOGS=1 vite serve -- --env.android --env.hmr';
	pkg.scripts['ios'] = 'VITE_DEBUG_LOGS=1 ns debug ios';
	pkg.scripts['android'] = 'VITE_DEBUG_LOGS=1 ns debug android';
}

function ensureGitignore() {
	const root = getProjectRootPath();
	const gitignorePath = path.join(root, '.gitignore');
	let contents = '';
	if (fs.existsSync(gitignorePath)) {
		contents = fs.readFileSync(gitignorePath, 'utf8');
	}
	if (!contents.split(/\r?\n/).includes('.ns-vite-build')) {
		if (contents.length && !contents.endsWith('\n')) {
			contents += '\n';
		}
		contents += '.ns-vite-build\n';
		fs.writeFileSync(gitignorePath, contents, 'utf8');
	}
}

function resolveFlavor(): string {
	const flavor = determineProjectFlavor();
	if (!flavor) {
		return 'javascript';
	}
	return flavor;
}

function getFlavorImportAndConfig(flavor: string): { importLine: string; configExpr: string } {
	switch (flavor) {
		case 'angular':
			return {
				importLine: "import { angularConfig } from '@nativescript/vite';",
				configExpr: 'angularConfig({})',
			};
		case 'react':
			return {
				importLine: "import { reactConfig } from '@nativescript/vite';",
				configExpr: 'reactConfig({})',
			};
		case 'solid':
			return {
				importLine: "import { solidConfig } from '@nativescript/vite';",
				configExpr: 'solidConfig({})',
			};
		case 'vue':
			return {
				importLine: "import { vueConfig } from '@nativescript/vite';",
				configExpr: 'vueConfig({})',
			};
		case 'typescript':
			return {
				importLine: "import { typescriptConfig } from '@nativescript/vite';",
				configExpr: 'typescriptConfig({})',
			};
		case 'javascript':
		default:
			return {
				importLine: "import { javascriptConfig } from '@nativescript/vite';",
				configExpr: 'javascriptConfig({})',
			};
	}
}

function ensureViteConfig() {
	const root = getProjectRootPath();
	const viteConfigPath = path.join(root, 'vite.config.ts');
	if (fs.existsSync(viteConfigPath)) {
		return;
	}
	const flavor = resolveFlavor();
	const { importLine, configExpr } = getFlavorImportAndConfig(flavor);
	const contents = `import { defineConfig } from 'vite';\n${importLine};\n\nexport default defineConfig(({ mode }) => ${configExpr});\n`;
	fs.writeFileSync(viteConfigPath, contents, 'utf8');
}

export async function runInit() {
	const pkg = readPackageJson();
	ensureDependencies(pkg);
	ensureScripts(pkg);
	writePackageJson(pkg);
	ensureGitignore();
	ensureViteConfig();
	console.log('[@nativescript/vite] Project initialized for Vite dev server.');
}
