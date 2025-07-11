#!/usr/bin/env node

import { redBright, green, greenBright, yellow } from 'ansi-colors';
import { program } from 'commander';
import dedent from 'ts-dedent';
import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

import { parseEnvFlags } from '../cli/parseEnvFlags';

const defaultConfig = path.resolve(
	__dirname,
	'../stubs/default.config.stub.js',
);
const tag = `[${green('@nativescript/webpack')}]`;

function error(message: string) {
	console.error(`${tag} ${redBright(dedent(message))}`);
}

function info(message: string) {
	console.info(`${tag} ${greenBright(dedent(message))}`);
}

program.enablePositionalOptions();

program
	.command('init')
	.description('Initialize a new webpack.config.js in the current directory.')
	.action(() => {
		const targetPath = path.resolve(process.cwd(), 'webpack.config.js');

		if (fs.existsSync(targetPath)) {
			return error(`File Already Exists: ${targetPath}`);
		}

		fs.copyFileSync(defaultConfig, targetPath);

		info('Initialized config.');
	});

program
	.command('build')
	.description('Build...')
	.option('--env [name]', 'environment name')
	.option('--config [path]', 'config path')
	.option('--watch', 'watch for changes')
	.allowUnknownOption()
	.allowExcessArguments()
	.action((options, command) => {
		const env = parseEnvFlags(command.args);
		// add --env <val> into the env object
		// for example if we use --env prod
		// we'd have env.env = 'prod'
		if (options.env) {
			env['env'] = options.env;
		}

		env['stats'] ??= true;
		env['watch'] ??= options.watch;

		// if --env.config is passed, we'll set an environment
		// variable to it's value so that the config Util
		// reads from the correct config file.
		process.env.NATIVESCRIPT_CONFIG_NAME ??= env['config'];

		const configPath = (() => {
			if (options.config) {
				return path.resolve(options.config);
			}

			return path.resolve(process.cwd(), 'webpack.config.js');
		})();

		// todo: validate config exists
		// todo: guard against invalid config
		let configuration: webpack.Configuration;
		try {
			configuration = require(configPath)(env);
		} catch (err) {
			console.log(err);
		}

		if (!configuration) {
			console.log('No configuration!');
			process.exitCode = 1;
			return;
		}

		const compiler = webpack(configuration);

		const webpackCompilationCallback = (
			err: webpack.WebpackError,
			stats: webpack.Stats,
		) => {
			if (err) {
				// Do not keep cache anymore
				compiler.purgeInputFileSystem();

				console.error(err.stack || err);
				if (err.details) {
					console.error(err.details);
				}

				process.exitCode = 1;
				return;
			}

			if (stats) {
				// Set the process exit code depending on errors
				process.exitCode = stats.hasErrors() ? 1 : 0;

				if (env.stats) {
					console.log(
						stats.toString({
							chunks: false,
							colors: true,
							errorDetails: env.verbose,
						}),
					);
				}

				// if webpack profile is enabled we write the stats to a JSON file
				if (configuration.profile || env.profile) {
					console.log(
						[
							'',
							'|',
							`|  The build profile has been written to ${yellow(
								'webpack.stats.json',
							)}`,
							`|  You can analyse the stats at ${green(
								'https://webpack.github.io/analyse/',
							)}`,
							'|',
							'',
						].join('\n'),
					);
					fs.writeFileSync(
						path.join(process.cwd(), 'webpack.stats.json'),
						JSON.stringify(stats.toJson()),
					);
				}
			}
		};

		if (options.watch) {
			env.stats && console.log('webpack is watching the files...');
			compiler.watch(
				configuration.watchOptions ?? {},
				webpackCompilationCallback,
			);
		} else {
			compiler.run((err, status) => {
				compiler.close((err2) =>
					webpackCompilationCallback(
						(err || err2) as webpack.WebpackError,
						status,
					),
				);
			});
		}
	});

program.version(require('../../package.json').version, '-v, --version');

program.parse(process.argv);
