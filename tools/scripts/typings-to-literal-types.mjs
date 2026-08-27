// dts-generator emits constants as `public static NAME: string = "v";`, which is
// TS1039 ("Initializers are not allowed in ambient contexts") inside a .d.ts.
// Rewrite each to the literal type the platform typings use.
import { readFileSync, writeFileSync } from 'node:fs';

const CONSTANT = /^(\t*public static [A-Za-z_0-9]+): (string|number|boolean) = (.*);$/;

// Booleans reach us as the raw constant-pool ints 0 and 1.
const BOOLEAN_LITERAL = { 0: 'false', 1: 'true' };
// Infinity and NaN are values, not types, so they cannot be used as literal types.
const NUMERIC_LITERAL = { Infinity: 'typeof Infinity', '-Infinity': 'typeof Infinity', NaN: 'typeof NaN' };

const [, , input, output] = process.argv;
let constants = 0;

const result = readFileSync(input, 'utf8')
	.split('\n')
	.map((line) => {
		const match = CONSTANT.exec(line);
		if (!match) return line;
		const [, declaration, type, value] = match;
		constants++;
		const literal = type === 'boolean' ? BOOLEAN_LITERAL[value] : (NUMERIC_LITERAL[value] ?? value);
		if (literal === undefined) throw new Error(`Unhandled ${type} constant value: ${line}`);
		return `${declaration}: ${literal};`;
	})
	.join('\n');

writeFileSync(output, result);
console.log(`Rewrote ${constants} constants to literal types.`);
