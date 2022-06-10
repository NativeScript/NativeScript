const nxPreset = require('@nrwl/jest/preset').default;
module.exports = {
	...nxPreset,
	testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
	transform: {
		'^.+\\.(ts|js|html)$': 'ts-jest',
	},
	resolver: '@nrwl/jest/plugins/resolver',
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageReporters: ['html'],
};
