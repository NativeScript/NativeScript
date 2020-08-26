import * as path from 'path';
import * as fs from 'fs';
import readdirp, { EntryInfo } from 'readdirp';

const inputFolder = path.resolve(process.argv[2]);

console.log(`Clearing private definitions in ${inputFolder}`);

function filterTypeScriptFiles(content: string) {
	var leadingPrivate = /^.*@private/gi;
	if (leadingPrivate.test(content)) {
		return { shouldDelete: true };
	}

	let blockCommentPrivate = /\/\*\*([^](?!\*\/))*@module([^](?!\*\/))*@private[^]*?\*\//g;
	if (blockCommentPrivate.test(content)) {
		return { shouldDelete: true };
	}

	let newContent = content;
	newContent = newContent.replace(/\/\/[\/\s]*@private[^]*?\/\/[\/\s]*?@endprivate/gm, '');

	if (newContent !== content) {
		return { shouldReplace: true, newContent: newContent };
	}

	return { shouldReplace: false, shouldDelete: false };
}

readdirp(inputFolder, {
	fileFilter: ['*.d.ts'],
	directoryFilter: function (di) {
		return !di.path.includes('node_modules');
	},
})
	.on('data', (entry: EntryInfo) => {
		const { fullPath } = entry;
		const content = fs.readFileSync(fullPath, 'utf8');
		const { shouldDelete, shouldReplace, newContent } = filterTypeScriptFiles(content);

		if (shouldDelete) {
			console.log('[Delete]', fullPath);
			fs.unlinkSync(fullPath);
		} else if (shouldReplace) {
			console.log('[Cleared]', fullPath);
			try {
				fs.writeFileSync(fullPath, newContent || '', 'utf8');
			} catch (error) {
				console.log('ERROR writing file: ' + fullPath, error);
				process.exit(1);
			}
		}
	})
	.on('warn', (error: Error) => console.error('non-fatal error', error))
	.on('error', (error: Error) => {
		console.error('fatal error', error);
		process.exit(1);
	})
	.on('end', () => console.log('done'));
