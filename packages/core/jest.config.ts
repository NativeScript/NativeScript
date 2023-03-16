import type { JestConfigWithTsJest } from 'ts-jest';

/* eslint-disable */
const jestConfig: JestConfigWithTsJest = {
	displayName: 'core',
	// preset: '../../jest.preset.js',
	preset: 'ts-jest/presets/default-esm',
	setupFiles: ['<rootDir>/jest.setup.ts'],
	testEnvironment: 'node',
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: '<rootDir>/tsconfig.spec.json',
			},
		],
	},
	extensionsToTreatAsEsm: ['.ts'],
	moduleDirectories: ['node_modules'],
	moduleFileExtensions: ['ts', 'js', 'ios.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
};

export default jestConfig;
