import path from 'path';
import { __dirname } from './project.js';

export const aliasCssTree = [
	// Node.js built-ins and mdn-data polyfills for css-tree
	{
		find: 'module',
		replacement: path.resolve(__dirname, '../polyfills/module.js'),
	},
	{
		find: 'mdn-data/css/properties.json',
		replacement: path.resolve(__dirname, '../polyfills/mdn-data-properties.js'),
	},
	{
		find: 'mdn-data/css/syntaxes.json',
		replacement: path.resolve(__dirname, '../polyfills/mdn-data-syntaxes.js'),
	},
	{
		find: 'mdn-data/css/at-rules.json',
		replacement: path.resolve(__dirname, '../polyfills/mdn-data-at-rules.js'),
	},
];
