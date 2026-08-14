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

	for (const [name, version] of Object.entries(RUNTIME_DEPS)) {
		pkg.dependencies[name] = version;
	}
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
				importLine: "import { angularConfig } from '@nativescript/vite/angular';",
				configExpr: 'angularConfig({ mode })',
			};
		case 'react':
			return {
				importLine: "import { reactConfig } from '@nativescript/vite/react';",
				configExpr: 'reactConfig({ mode })',
			};
		case 'solid':
			return {
				importLine: "import { solidConfig } from '@nativescript/vite/solid';",
				configExpr: 'solidConfig({ mode })',
			};
		case 'vue':
			return {
				importLine: "import { vueConfig } from '@nativescript/vite/vue';",
				configExpr: 'vueConfig({ mode })',
			};
		case 'typescript':
			return {
				importLine: "import { typescriptConfig } from '@nativescript/vite/typescript';",
				configExpr: 'typescriptConfig({ mode })',
			};
		case 'javascript':
		default:
			return {
				importLine: "import { javascriptConfig } from '@nativescript/vite/javascript';",
				configExpr: 'javascriptConfig({ mode })',
			};
	}
}

function ensureViteConfig() {
	const root = getProjectRootPath();
	const existing = ['vite.config.mts', 'vite.config.ts', 'vite.config.mjs', 'vite.config.js', 'vite.config.cts', 'vite.config.cjs'].find((name) => fs.existsSync(path.join(root, name)));
	if (existing) {
		return;
	}
	// `.mts` keeps the config ESM regardless of the app package.json `type`,
	// which NativeScript apps leave unset — a `.ts` config there is CJS-scoped
	// and trips Vite's `configLoader: 'native'` forward-compat warning.
	const viteConfigPath = path.join(root, 'vite.config.mts');
	const flavor = resolveFlavor();
	const { importLine, configExpr } = getFlavorImportAndConfig(flavor);
	const contents = `import { defineConfig } from 'vite';\n${importLine};\n\nexport default defineConfig(({ mode }) => ${configExpr});\n`;
	fs.writeFileSync(viteConfigPath, contents, 'utf8');
}

export async function runInit() {
	const pkg = readPackageJson();
	ensureDependencies(pkg);
	writePackageJson(pkg);
	ensureGitignore();
	ensureViteConfig();
	console.log('[@nativescript/vite] Project initialized for Vite dev server.');
}
