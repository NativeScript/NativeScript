/* eslint-disable */
export default {
	displayName: 'core',
	preset: '../../jest.preset.js',
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
	extensionsToTreatAsEsm: ['.ts', '.ios.ts', '.android.ts'],
	moduleDirectories: ['node_modules'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'ios.ts', 'android.ts'],
	coverageDirectory: '../../coverage/core',
};
