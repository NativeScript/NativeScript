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

export type TypeCheckMode = 'off' | 'warn' | 'error';

export type TypeCheckSetting =
	| boolean
	| TypeCheckMode
	| {
			enabled?: boolean;
			failOnError?: boolean;
			logDiagnostics?: boolean;
			mode?: TypeCheckMode;
	  };

export interface TypeCheckControlOptions {
	typeCheck?: TypeCheckSetting;
}

type ResolvedTypeCheckOptions = {
	platform?: PlatformType;
	verbose?: boolean;
	enabled: boolean;
	failOnError?: boolean;
	logDiagnostics: boolean;
};

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

function coerceBoolean(value: unknown): boolean | undefined {
	if (typeof value === 'boolean') {
		return value;
	}

	if (typeof value === 'string') {
		switch (value.trim().toLowerCase()) {
			case '1':
			case 'true':
			case 'yes':
			case 'on':
				return true;
			case '0':
			case 'false':
			case 'no':
			case 'off':
				return false;
		}
	}

	return undefined;
}

function coerceTypeCheckMode(value: unknown): TypeCheckMode | undefined {
	if (typeof value !== 'string') {
		return undefined;
	}

	switch (value.trim().toLowerCase()) {
		case 'off':
		case 'false':
		case 'disabled':
			return 'off';
		case 'warn':
		case 'warning':
		case 'log':
			return 'warn';
		case 'error':
		case 'strict':
		case 'true':
			return 'error';
		default:
			return undefined;
	}
}

function applyTypeCheckMode(base: ResolvedTypeCheckOptions, mode: TypeCheckMode): ResolvedTypeCheckOptions {
	switch (mode) {
		case 'off':
			return { ...base, enabled: false, failOnError: false };
		case 'warn':
			return { ...base, enabled: true, failOnError: false, logDiagnostics: true };
		case 'error':
		default:
			return { ...base, enabled: true, failOnError: true, logDiagnostics: true };
	}
}

function shouldFailOnTypeCheckError(opts: { failOnError?: boolean }, parsedConfig: ts.ParsedCommandLine): boolean {
	if (typeof opts.failOnError === 'boolean') {
		return opts.failOnError;
	}

	return parsedConfig.options.noEmitOnError === true;
}

function normalizeTypeCheckSetting(base: ResolvedTypeCheckOptions, setting?: TypeCheckSetting): ResolvedTypeCheckOptions {
	if (typeof setting === 'undefined') {
		return base;
	}

	if (typeof setting === 'boolean') {
		return applyTypeCheckMode(base, setting ? 'error' : 'off');
	}

	if (typeof setting === 'string') {
		const mode = coerceTypeCheckMode(setting);
		return mode ? applyTypeCheckMode(base, mode) : base;
	}

	let next = { ...base };
	if (setting.mode) {
		next = applyTypeCheckMode(next, setting.mode);
	}

	if (typeof setting.enabled === 'boolean') {
		next.enabled = setting.enabled;
	}

	if (typeof setting.failOnError === 'boolean') {
		next.failOnError = setting.failOnError;
	}

	if (typeof setting.logDiagnostics === 'boolean') {
		next.logDiagnostics = setting.logDiagnostics;
	}

	if (!next.enabled) {
		next.failOnError = false;
	}

	return next;
}

function getTypeCheckOptions(setting?: TypeCheckSetting): ResolvedTypeCheckOptions {
	const flags = getCliFlags();
	const platform: PlatformType | undefined = flags.android ? 'android' : flags.ios ? 'ios' : flags.visionos ? 'visionos' : undefined;
	const verbose = process.env.DEBUG === '1' || process.env.DEBUG === 'true';
	const envMode = coerceTypeCheckMode(process.env.NS_VITE_TYPECHECK ?? process.env.NS_VITE_TYPE_CHECK);
	const cliMode = coerceTypeCheckMode(flags.typecheck ?? flags['type-check'] ?? flags.typeCheck);

	let resolved: ResolvedTypeCheckOptions = {
		platform,
		verbose,
		enabled: true,
		logDiagnostics: true,
	};

	resolved = normalizeTypeCheckSetting(resolved, setting);
	if (envMode) {
		resolved = applyTypeCheckMode(resolved, envMode);
	}
	if (cliMode) {
		resolved = applyTypeCheckMode(resolved, cliMode);
	}

	const envLogDiagnostics = coerceBoolean(process.env.NS_VITE_TYPECHECK_LOG ?? process.env.NS_VITE_TYPE_CHECK_LOG);
	if (typeof envLogDiagnostics === 'boolean') {
		resolved.logDiagnostics = envLogDiagnostics;
	}

	return resolved;
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

export function typescriptCheckPlugin(opts: { platform?: PlatformType; verbose?: boolean; failOnError?: boolean; logDiagnostics?: boolean }): Plugin {
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
			const failOnError = shouldFailOnTypeCheckError(opts, parsedConfig);
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

			if (opts.logDiagnostics !== false) {
				const output = ts.formatDiagnosticsWithColorAndContext(diagnostics, getFormatHost());
				(failOnError ? console.error : console.warn)(output);
			}
			const errorCount = diagnostics.length;
			if (!failOnError) {
				console.warn(`[ns-vite] TypeScript found ${errorCount} error${errorCount === 1 ? '' : 's'}; continuing build because tsconfig does not require failing on type errors.`);
				return;
			}

			throw new Error(`[ns-vite] TypeScript found ${errorCount} error${errorCount === 1 ? '' : 's'}.`);
		},
	};
}

export function vueTypeCheckPlugin(opts: { platform?: PlatformType; verbose?: boolean; failOnError?: boolean; logDiagnostics?: boolean }): Plugin {
	return {
		name: 'ns-vue-tsc-check',
		apply: 'build',
		buildStart() {
			const tsConfigPath = getProjectTSConfigPath();
			if (!tsConfigPath) {
				return;
			}

			const parsedConfig = getParsedConfig(tsConfigPath, opts.platform);
			const failOnError = shouldFailOnTypeCheckError(opts, parsedConfig);

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
			if (output && opts.logDiagnostics !== false) {
				(failOnError ? console.error : console.warn)(output);
			}

			if (!failOnError) {
				console.warn('[ns-vite] vue-tsc reported type errors; continuing build because tsconfig does not require failing on type errors.');
				return;
			}

			throw new Error('[ns-vite] vue-tsc reported type errors.');
		},
	};
}

export function getTypeCheckPlugins(flavor: TypeCheckFlavor, setting?: TypeCheckSetting): Plugin[] {
	const options = getTypeCheckOptions(setting);
	if (!options.enabled) {
		return [];
	}

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
