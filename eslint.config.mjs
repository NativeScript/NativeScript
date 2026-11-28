import nx from '@nx/eslint-plugin';

export default [
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: [],
					// Nx records require() as a dynamic dependency, so one platform-conditional
					// require() of a core module would flag every static core import in that project.
					// Apps bundle core whole; it is never code-split.
					checkDynamicDependenciesExceptions: ['@nativescript/core', '@nativescript/core/**'],
					depConstraints: [
						{
							sourceTag: '*',
							onlyDependOnLibsWithTags: ['*'],
						},
					],
				},
			],
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			'no-empty': 'off',
			'no-useless-escape': 'off',
			'no-inner-declarations': 'off',
			'no-prototype-builtins': 'off',
			'@typescript-eslint/no-empty-interface': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-this-alias': 'warn',
			'@typescript-eslint/no-namespace': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-wrapper-object-types': 'off',
			'@typescript-eslint/no-unsafe-declaration-merging': 'off',
			'@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
			'no-extra-semi': 'off',
		},
	},
	{
		files: ['**/*.js', '**/*.jsx'],
		rules: {
			'no-extra-semi': 'off',
		},
	},
	{
		files: ['**/references.d.ts', 'apps/automated/reference.d.ts'],
		rules: {
			'@typescript-eslint/triple-slash-reference': 'off',
		},
	},
	{
		// Not in packages/core: its build and the HMR core bundle ship every *.mjs.
		ignores: ['packages/core/**/global-types.d.ts', 'packages/core/**/node_modules/**/*', 'packages/core/**/__tests__/**/*', 'packages/core/**/platforms/**/*', 'apps/**/platforms/**/*', 'packages/core/**/css/lib/**/*', 'packages/core/**/vite.config.*.timestamp*', 'packages/core/**/vitest.config.*.timestamp*', 'packages/core/**/*.{js,jsx,mjs,cjs,mts,cts}', '!packages/core/**/*.spec.{js,jsx}'],
	},
];
