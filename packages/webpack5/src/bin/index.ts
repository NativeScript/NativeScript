#!/bin/env node

import { redBright, green, greenBright } from 'chalk';
import { program } from 'commander';
import dedent from 'ts-dedent';
import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

import { parseEnvFlags } from '../cli/parseEnvFlags';

const defaultConfig = path.resolve(
	__dirname,
	'../stubs/default.config.stub.js'
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
	.option('--env [name]', 'environment options')
	.option('--hmr', 'enable HMR')
	.option('--no-hmr', 'disable HMR')
	.option('--watch', 'watch for changes')
	.allowUnknownOption()
	.action((options, command) => {
		const env = parseEnvFlags(command.args);
		// add --env <val> into the env object
		// for example if we use --env prod
		// we'd have env.env = 'prod'
		if (options.env) {
			env['env'] = options.env;
		}
		// const env = {
		// 	platform: 'ios',
		// 	verbose: true,
		// 	appResourcesPath: 'App_Resources',
		// 	appPath: 'src'
		// }

		const configPath = path.resolve(process.cwd(), 'webpack.config.js');
		// todo: validate config exists
		// todo: guard against invalid config
		let configuration;
		try {
			configuration = require(configPath)(env);
		} catch (ignore) {
			console.log(ignore);
		}

		if (!configuration) {
			console.log('No configuration!!!!!');
			return;
		}

		const compiler = webpack(configuration);

		// todo: handle --watch flag
		// todo: promisify callback?
		compiler.watch(
			{
				ignored: ['platforms'],
			},
			(err, stats) => {
				if (stats) {
					console.log(
						stats.toString({
							colors: true,
						})
					);
				}
				// err && console.log(err)
			}
		);
	});

program.parse(process.argv);
