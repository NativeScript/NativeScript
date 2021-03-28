import Config from 'webpack-chain';
import { resolve } from 'path'

import { additionalCopyRules } from '../../src/helpers/copyRules'
import {
	default as angular,
	getFileReplacementsFromWorkspaceConfig,
	applyFileReplacements
} from '../../src/configuration/angular';
import { init } from '../../src';

jest.mock(
	'@ngtools/webpack',
	() => {
		class AngularCompilerPlugin {
		}

		return {
			AngularCompilerPlugin,
		};
	},
	{ virtual: true }
);

describe('angular configuration', () => {
	const platforms = ['ios', 'android'];
	let fsExistsSyncSpy: jest.SpiedFunction<any>;

	beforeAll(() => {
		const fs = require('fs')
		const original = fs.existsSync;
		fsExistsSyncSpy = jest.spyOn(fs, 'existsSync')

		fsExistsSyncSpy.mockImplementation((path) => {
			if (path === '__jest__/tsconfig.json') {
				return true;
			}
			return original.call(fs, path)
		})
	})

	afterAll(() => {
		fsExistsSyncSpy.mockRestore();
	})

	for (let platform of platforms) {
		it(`for ${platform}`, () => {
			init({
				[platform]: true,
			});
			expect(angular(new Config()).toString()).toMatchSnapshot();
		});
	}

	describe('workspace configuration', () => {
		it('no config', () => {
			init({
				ios: true,
				configuration: 'dev',
				projectName: 'testProject'
			})
			const res = getFileReplacementsFromWorkspaceConfig(
				''
			)

			expect(res).toBe(null)
		})

		it('no project', () => {
			init({
				ios: true,
				configuration: 'dev',
				projectName: 'nonProject'
			})
			const res = getFileReplacementsFromWorkspaceConfig(
				resolve(__dirname, './__fixtures__/workspace-without-replacements.json')
			)

			expect(res).toBe(null);
		})

		it('no replacements', () => {
			init({
				ios: true,
				configuration: 'dev',
				projectName: 'testProject'
			})
			const res = getFileReplacementsFromWorkspaceConfig(
				resolve(__dirname, './__fixtures__/workspace-without-replacements.json')
			)

			expect(res).toBeDefined();
			expect(res).toEqual({});
		})

		it('default file replacements', () => {
			init({
				// irrelevant to this test case - ensures getPlatformName() returns a valid platform
				ios: true,

				configuration: 'dev',
				projectName: 'testProject'
			})
			const res = getFileReplacementsFromWorkspaceConfig(
				resolve(__dirname, './__fixtures__/workspace.json')
			)
			const entries = Object.entries(res)

			expect(res).toBeDefined();
			expect(entries.length).toBe(1)
			expect(entries[0]).toEqual([
				resolve(__dirname, './__fixtures__/src/something.ts'),
				resolve(__dirname, './__fixtures__/src/something.replaced.ts'),
			])
		})

		it('ios file replacements', () => {
			init({
				ios: true,
				configuration: 'dev',
				projectName: 'testProject'
			})
			const res = getFileReplacementsFromWorkspaceConfig(
				resolve(__dirname, './__fixtures__/workspace-with-platform-replacements.json')
			)
			const entries = Object.entries(res)

			expect(res).toBeDefined();
			expect(entries.length).toBe(1)
			expect(entries[0]).toEqual([
				resolve(__dirname, './__fixtures__/src/something.ts'),
				resolve(__dirname, './__fixtures__/src/something.replaced.ios.ts'),
			])
		})

		it('android file replacements', () => {
			init({
				android: true,
				configuration: 'dev',
				projectName: 'testProject'
			})
			const res = getFileReplacementsFromWorkspaceConfig(
				resolve(__dirname, './__fixtures__/workspace-with-platform-replacements.json')
			)
			const entries = Object.entries(res)

			expect(res).toBeDefined();
			expect(entries.length).toBe(1)
			expect(entries[0]).toEqual([
				resolve(__dirname, './__fixtures__/src/something.ts'),
				resolve(__dirname, './__fixtures__/src/something.replaced.android.ts'),
			])
		})

		it('applies file replacements', () => {
			const config = new Config();
			applyFileReplacements(config, {
				// should apply as an alias
				'foo.ts': 'foo.replaced.ts',

				// should apply as a file replacement using the copy plugin
				'foo.json': 'foo.replaced.json'
			})

			expect(config.resolve.alias.get('foo.ts')).toBe('foo.replaced.ts')
			expect(additionalCopyRules.length).toBe(1)
			expect(additionalCopyRules[0]).toEqual({
				from: 'foo.replaced.json',
				to: 'foo.json',
				force: true,
			})
		})
	})
});
