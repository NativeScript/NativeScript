import baseConfig from '../../eslint.config.mjs';

export default [
	...baseConfig,
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		languageOptions: {
			parserOptions: {
				project: ['packages/vite/tsconfig.*?.json'],
			},
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-wrapper-object-types': 'off',
			'@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
			'no-constant-condition': ['error', { checkLoops: false }],
		},
	},
	{
		ignores: ['**/node_modules/**/*', '**/dist/**/*', '**/*.timestamp*', 'docs/**/*'],
	},
];
