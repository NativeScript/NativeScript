import { readFileSync, writeFileSync, existsSync } from 'fs';
import { program } from 'commander';
import { resolve } from 'path';

program
	.description('Inject globals into a dist file')
	.arguments('<target> <globals...>')
	.parse(process.argv);

const target = resolve(program.args[0]);

if (!existsSync(target)) {
	console.log(`Invalid target: ${program.args[0]}. ${target} does not exist.`);

	process.exit(1);
}

const globals = program.args.slice(1);
const toInject = globals.map((global) => {
	const [name, value] = global.split('=');
	return `global.${name} = ${value};`;
});

console.log(`Injecting to ${target}:`);
console.log(toInject.join('\n'));

let fileContents = readFileSync(target).toString();
fileContents = `${fileContents}\n${toInject.join('\n')}`;

writeFileSync(target, fileContents);
