// Writes packages/core/platforms/linux/native-api-usage.json: the C APIs core's
// Linux sources use, so apps that filter metadata keep what core needs.
// Usage: node tools/scripts/linux-native-api-usage.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(import.meta.dirname, '../..');
const core = join(root, 'packages/core');
const typings = join(root, 'packages/types-minimal/src/lib/linux');

// declared name -> module, from the generated c!<module>.d.ts
const owner = new Map();
for (const file of readdirSync(typings)) {
	const module = /^c!(.+)\.d\.ts$/.exec(file)?.[1];
	if (!module) continue;
	const source = readFileSync(join(typings, file), 'utf8');
	for (const [, name] of source.matchAll(/^declare (?:function|const enum|const|var|class) (\w+)/gm)) {
		if (!owner.has(name)) owner.set(name, module);
	}
}

const sources = (readdirSync(core, { recursive: true })).filter((f) => f.endsWith('.linux.ts') && !f.includes('node_modules'));
const uses = new Set();
for (const file of sources) {
	const code = readFileSync(join(core, file), 'utf8');
	for (const [name] of code.matchAll(/\b[A-Za-z_]\w*\b/g)) {
		const module = owner.get(name);
		if (module) uses.add(`${module}:${name}`);
	}
	// names built at runtime: `gtk_widget_set_margin_${side}`
	for (const [, prefix] of code.matchAll(/`([a-z][a-z0-9_]*_)\$\{/g)) {
		const module = [...owner].find(([name]) => name.startsWith(prefix))?.[1];
		if (module) uses.add(`${module}:${prefix}*`);
	}
}

const out = join(core, 'platforms/linux/native-api-usage.json');
writeFileSync(out, JSON.stringify({ uses: [...uses].sort() }, null, 2) + '\n');
console.log(`${relative(root, out)}: ${uses.size} entries from ${sources.length} files`);
