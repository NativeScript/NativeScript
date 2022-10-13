#!/usr/bin/env zx
import 'zx/globals';

import path from 'path';

const webpack5Path = path.resolve(__dirname, '../../packages/webpack5');
const distPath = path.resolve(__dirname, '../../dist/packages');

const packageJSON = await fs.readJSON(`${webpack5Path}/package.json`);
const tgzName = `nativescript-webpack-${packageJSON.version}.tgz`;

cd(webpack5Path);

await $`npm install`;
await $`npm pack`;

const from = path.join(webpack5Path, tgzName);
const to = path.join(distPath, 'nativescript-webpack.tgz');

await fs.move(from, to, {
	overwrite: true,
});

console.log(chalk.green(`@nativescript/webpack has been built and packed.\n`));
console.log(to);
