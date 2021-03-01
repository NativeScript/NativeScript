#!/usr/bin/env node

import { redBright, green, greenBright } from 'chalk';
import { program } from 'commander';
import dedent from 'ts-dedent';
import path from 'path';
import fs from 'fs';

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

program.parse(process.argv);
