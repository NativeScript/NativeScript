import jsoncParser from 'jsonc-eslint-parser';
import baseConfig from '../../eslint.config.mjs';

export default [
	...baseConfig,
	{
		files: ['**/*.json'],
		languageOptions: {
			parser: jsoncParser,
		},
		rules: {
			'@nx/dependency-checks': 'error',
		},
	},
	{
		files: ['package.json', 'generators.json'],
		languageOptions: {
			parser: jsoncParser,
		},
		rules: {
			'@nx/nx-plugin-checks': 'error',
		},
	},
];
