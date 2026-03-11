import type { Plugin } from 'vite';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import { getCliFlags } from './cli-flags.js';
import { getProjectTSConfigPath } from './project.js';

const require = createRequire(import.meta.url);

export type PlatformType = 'android' | 'ios' | 'visionos';
type TypeCheckFlavor = 'typescript' | 'react' | 'solid' | 'vue' | 'angular' | 'javascript';

function getModuleSuffixes(platform: PlatformType | undefined): string[] {
	if (platform === 'android') {
		return ['.android', '.native', ''];
	}

	if (platform === 'ios') {
		return ['.ios', '.native', ''];
	}

	if (platform === 'visionos') {
		return ['.visionos', '.ios', '.native', ''];
	}

	return ['.native', ''];
}

function getFormatHost(): ts.FormatDiagnosticsHost {
	return {
		getCanonicalFileName: (fileName) => fileName,
		getCurrentDirectory: () => process.cwd(),
		getNewLine: () => ts.sys.newLine,
	};
}

function getVueTscBinPath(): string {
	const pkgPath = require.resolve('vue-tsc/package.json');
	return path.resolve(path.dirname(pkgPath), 'bin/vue-tsc.js');
}

function getTypeCheckOptions(): { platform?: PlatformType; verbose?: boolean } {
	const flags = getCliFlags();
	const platform: PlatformType | undefined = flags.android ? 'android' : flags.ios ? 'ios' : flags.visionos ? 'visionos' : undefined;
	const verbose = process.env.DEBUG === '1' || process.env.DEBUG === 'true';

	return { platform, verbose };
}

function collectDiagnostics(program: ts.Program, parsedConfig: ts.ParsedCommandLine): readonly ts.Diagnostic[] {
	return ts.sortAndDeduplicateDiagnostics([...parsedConfig.errors, ...program.getOptionsDiagnostics(), ...program.getGlobalDiagnostics(), ...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()]);
}

function isProjectDiagnostic(diagnostic: ts.Diagnostic, projectRoot: string): boolean {
	if (!diagnostic.file) {
		return true;
	}

	const filePath = path.resolve(diagnostic.file.fileName);
	const relativePath = path.relative(projectRoot, filePath);
	return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}

function isPlatformRelevantDiagnostic(diagnostic: ts.Diagnostic, platform: PlatformType | undefined): boolean {
	if (!diagnostic.file) {
		return true;
	}

	return !shouldSkipFileForPlatform(diagnostic.file.fileName, platform);
}

function getParsedConfig(tsConfigPath: string, platform: PlatformType | undefined): ts.ParsedCommandLine {
	const parsedConfig = ts.getParsedCommandLineOfConfigFile(
		tsConfigPath,
		{
			noEmit: true,
			incremental: false,
			moduleSuffixes: getModuleSuffixes(platform),
		},
		{
			...ts.sys,
			onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
				throw new Error(ts.formatDiagnosticsWithColorAndContext([diagnostic], getFormatHost()));
			},
		},
	);

	if (!parsedConfig) {
		throw new Error('[ns-vite] Failed to read TypeScript configuration.');
	}

	return parsedConfig;
}

function shouldSkipFileForPlatform(fileName: string, platform: PlatformType | undefined): boolean {
	const normalized = fileName.replace(/\\/g, '/');
	const isAndroidTagged = /\.android\./.test(normalized);
	const isIosTagged = /\.(ios|visionos)\./.test(normalized);

	if (platform === 'android') {
		return isIosTagged;
	}

	if (platform === 'ios') {
		return isAndroidTagged || /\.visionos\./.test(normalized);
	}

	if (platform === 'visionos') {
		return isAndroidTagged;
	}

	return false;
}

export function typescriptCheckPlugin(opts: { platform?: PlatformType; verbose?: boolean }): Plugin {
	return {
		name: 'ns-typescript-check',
		apply: 'build',
		async buildStart() {
			const tsConfigPath = getProjectTSConfigPath();
			if (!tsConfigPath) {
				return;
			}

			const projectRoot = path.resolve(process.cwd());
			const parsedConfig = getParsedConfig(tsConfigPath, opts.platform);
			const rootNames = parsedConfig.fileNames.filter((fileName) => !shouldSkipFileForPlatform(fileName, opts.platform));
			const program = ts.createProgram({
				rootNames,
				options: parsedConfig.options,
				projectReferences: parsedConfig.projectReferences,
			});
			const diagnostics = collectDiagnostics(program, parsedConfig).filter((diagnostic) => isProjectDiagnostic(diagnostic, projectRoot) && isPlatformRelevantDiagnostic(diagnostic, opts.platform));

			if (!diagnostics.length) {
				if (opts.verbose) {
					console.log(`[ns-vite] TypeScript check passed (${rootNames.length} files).`);
				}
				return;
			}

			console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, getFormatHost()));
			const errorCount = diagnostics.length;
			throw new Error(`[ns-vite] TypeScript found ${errorCount} error${errorCount === 1 ? '' : 's'}.`);
		},
	};
}

export function vueTypeCheckPlugin(opts: { platform?: PlatformType; verbose?: boolean }): Plugin {
	return {
		name: 'ns-vue-tsc-check',
		apply: 'build',
		buildStart() {
			const tsConfigPath = getProjectTSConfigPath();
			if (!tsConfigPath) {
				return;
			}

			const vueTscBinPath = getVueTscBinPath();
			const moduleSuffixes = getModuleSuffixes(opts.platform).join(',');
			const result = spawnSync(process.execPath, [vueTscBinPath, '--noEmit', '--pretty', '-p', tsConfigPath, '--moduleSuffixes', moduleSuffixes], {
				cwd: process.cwd(),
				env: { ...process.env, FORCE_COLOR: '1' },
				encoding: 'utf8',
			});

			if (result.error) {
				throw result.error;
			}

			if (result.status === 0) {
				if (opts.verbose) {
					console.log('[ns-vite] vue-tsc check passed.');
				}
				return;
			}

			const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
			if (output) {
				console.error(output);
			}

			throw new Error(`[ns-vite] vue-tsc found ${result.status ?? 'unknown'} error${result.status === 1 ? '' : 's'}.`);
		},
	};
}

export function getTypeCheckPlugins(flavor: TypeCheckFlavor): Plugin[] {
	const options = getTypeCheckOptions();

	switch (flavor) {
		case 'typescript':
		case 'react':
		case 'solid':
			return [typescriptCheckPlugin(options)];
		case 'vue':
			return [vueTypeCheckPlugin(options)];
		case 'angular':
		case 'javascript':
		default:
			return [];
	}
}
