#!/usr/bin/env zx
import 'zx/globals';

import path from 'path';

const rspackPath = path.resolve(__dirname, '../../packages/rspack');
const distPath = path.resolve(__dirname, '../../dist/packages');

const packageJSON = await fs.readJSON(`${rspackPath}/package.json`);
const tgzName = `nativescript-rspack-${packageJSON.version}.tgz`;

cd(rspackPath);

await $`npm install`;
await $`npm pack`;

const from = path.join(rspackPath, tgzName);
const to = path.join(distPath, tgzName);

await fs.move(from, to, {
	overwrite: true,
});

console.log(chalk.green(`@nativescript/rspack has been built and packed.\n`));
console.log(to);
