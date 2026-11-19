import solid from 'vite-plugin-solid';
import path from 'path';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { getProjectRootPath } from '../helpers/project.js';
import { mergeConfig, type UserConfig } from 'vite';
import { baseConfig } from './base.js';
import { getTypeCheckPlugins, type TypeCheckControlOptions } from '../helpers/typescript-check.js';
import { resolveSolidDevEntry, SOLID_RUNTIME_PACKAGES } from '../helpers/solid-runtime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = getProjectRootPath();
const solidPath = path.resolve(projectRoot, 'node_modules/solid-js');

// Built-in JSX runtime shim — maps automatic JSX transform's jsx() to
// Solid's createComponent() without pulling in the web renderer (solid-js/h).
const jsxRuntimeShimPath = resolve(dirname(__dirname), 'shims', 'solid-jsx-runtime.js');

// Build the Solid plugin stack for a given build kind. `prod` is derived from
// Vite's `mode` inside the factory (NOT a non-standard `process.env.production`),
// so a production build resolves Solid's prod bundles and disables dev/hot.
const exactAlias = (spec: string, replacement: string) => ({ find: new RegExp(`^${spec.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}$`), replacement });

// Matches are anchored: other subpaths (e.g. Solid 2's `solid-js/internal`)
// must fall through to the package's exports map.
const buildSolidAliasEntries = (prod: boolean) => {
	const entries = [
		// Solid 1.x subpath layout.
		exactAlias('solid-js/web', resolve(solidPath, `web/dist/${prod ? 'web' : 'dev'}.js`)),
		exactAlias('solid-js/universal', resolve(solidPath, `universal/dist/${prod ? 'universal' : 'dev'}.js`)),
		exactAlias('solid-js/store', resolve(solidPath, `store/dist/${prod ? 'store' : 'dev'}.js`)),
		exactAlias('solid-js/jsx-runtime', jsxRuntimeShimPath),
		exactAlias('solid-js/jsx-dev-runtime', jsxRuntimeShimPath),
		exactAlias('solid-js', prod ? resolve(solidPath, 'dist/solid.js') : (resolveSolidDevEntry('solid-js', projectRoot)?.absPath ?? resolve(solidPath, 'dist/dev.js'))),
	];
	if (!prod) {
		// base.ts's resolve.conditions omit `development`, so without these the
		// remaining runtime packages resolve to prod builds next to solid-js dev.
		for (const pkg of SOLID_RUNTIME_PACKAGES) {
			if (pkg === 'solid-js') continue;
			const devEntry = resolveSolidDevEntry(pkg, projectRoot);
			if (devEntry) entries.push(exactAlias(pkg, devEntry.absPath));
		}
	}
	return entries;
};

const buildSolidPlugins = (prod: boolean) => [
	{
		...alias({ entries: buildSolidAliasEntries(prod) }),
		enforce: 'pre',
	},
	// Enable SolidJS support with NativeScript configuration
	solid({
		// Configure for development
		dev: !prod,
		// solid-refresh's `import.meta.hot`-based component HMR is intentionally
		// left OFF. NativeScript drives HMR through its own dev-server runtime,
		// and solid-refresh additionally rewrites `export function Foo()` into a
		// non-hoisted `export const Foo = _$$component(...)`. That breaks the
		// canonical TanStack Router file-route pattern —
		// `export const Route = createFileRoute('/')({ component: App })`
		// declared above `function App() {}` — which then throws
		// "Cannot access 'App' before initialization" (a TDZ error) during module
		// evaluation and aborts the dev session. Solid dev mode (`dev`) stays on
		// for reactivity warnings; module-level HMR still works via the
		// NativeScript runtime.
		hot: false,
		// Configure solid compiler options for NativeScript
		solid: {
			// Use universal instead of dom for NativeScript compatibility
			generate: 'universal',
			hydratable: false,
			// Use the NativeScript community SolidJS renderer
			moduleName: '@nativescript-community/solid-js',
		},
	}),
];

export const solidConfig = ({ mode }, options: TypeCheckControlOptions = {}): UserConfig => {
	const prod = mode !== 'development';
	return mergeConfig(baseConfig({ mode, flavor: 'solid' }), {
		plugins: [...getTypeCheckPlugins('solid', options.typeCheck), ...buildSolidPlugins(prod)],
	});
};
