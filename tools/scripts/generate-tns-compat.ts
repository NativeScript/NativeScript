import * as path from 'path';
import * as fs from 'fs';
import readdirp, { EntryInfo } from 'readdirp';

const inputFolder = path.resolve('dist/packages/core');
const outputFolder = path.resolve('dist/packages/tns-core-modules');
const testImports: string[] = [];

// List of definition files that don't need to be exported.
const dtsBlacklist = ['global-types.d.ts', 'references.d.ts'];

// List of modules that should be re-exported despite they are private
const privateModulesWhitelist = [
	'ui/styling/style-scope', //Reason: nativescript-dev-webpack generates code that imports this module
];

// There are few module using the "export default" syntax
// They should be handled differently when re-exporting
const modulesWithDefaultExports = ['utils/lazy'];

function traverseInputDir(fileFilter: string[], callback: (entry: EntryInfo) => void) {
	return new Promise((resolve, reject) => {
		readdirp(inputFolder, {
			fileFilter,
			directoryFilter: (di: EntryInfo) => {
				return !di.path.startsWith('node_modules') && !di.path.startsWith('platforms');
			},
		})
			.on('data', callback)
			.on('error', reject)
			.on('end', resolve);
	});
}

function processPackageJsonFile(entry: EntryInfo) {
	const dirPath = path.dirname(entry.path);
	const outputFilePath = path.join(outputFolder, entry.path);

	ensureDirectoryExistence(outputFilePath);

	const json = require(entry.fullPath);
	if (json.main) {
		(<any>fs).copyFileSync(entry.fullPath, outputFilePath);
		logFileCreated(outputFilePath);
		addTestImport(dirPath);

		const mainFile = path.join(dirPath, json.main);
		createReExportFile(mainFile, '.ts');
		addTestImport(mainFile);
	}
}

function processDefinitionFile(entry: EntryInfo) {
	if (dtsBlacklist.includes(entry.path)) {
		return;
	}

	const relativeFilePathNoExt = entry.path.replace(/\.d\.ts$/, '');

	// Re-export everything from d.ts file
	createReExportFile(relativeFilePathNoExt, '.d.ts');

	// This might be only a definitions file.
	// So check if there is ts/js files before creating TS file with re-exports
	const baseFile = path.join(inputFolder, relativeFilePathNoExt);
	if (fs.existsSync(baseFile + '.ts') || fs.existsSync(baseFile + '.js') || (fs.existsSync(baseFile + '.android.ts') && fs.existsSync(baseFile + '.ios.ts')) || (fs.existsSync(baseFile + '.android.js') && fs.existsSync(baseFile + '.ios.js'))) {
		createReExportFile(relativeFilePathNoExt, '.ts');
		addTestImport(relativeFilePathNoExt);
	}
}

function processTypeScriptFile(entry: EntryInfo) {
	const relativeFilePathNoExt = entry.path.replace(/\.ts$/, '');

	createReExportFile(relativeFilePathNoExt, '.ts');
	addTestImport(relativeFilePathNoExt);
}

function createReExportFile(pathNoExt: string, ext: '.ts' | '.d.ts') {
	const outputFile = path.join(outputFolder, pathNoExt + ext);
	if (!fs.existsSync(outputFile)) {
		ensureDirectoryExistence(outputFile);
		let content = `export * from "@nativescript/core/${pathNoExt}";`;
		if (modulesWithDefaultExports.includes(pathNoExt)) {
			content = `import defExport from "@nativescript/core/${pathNoExt}";\n`;
			content += `export default defExport;`;
		}

		fs.writeFileSync(outputFile, content);
		logFileCreated(outputFile);
	}
}

function ensureDirectoryExistence(filePath: string) {
	const dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

function logFileCreated(file: string) {
	console.log(`CREATED: ${file}`);
}

function addTestImport(moduleName: string) {
	testImports.push(moduleName);
}

function generateTestFile() {
	const uniqueImports = Array.from(new Set(testImports)).sort();

	const output: string[] = [];

	output.push(`/* tslint:disable */`);
	output.push(`import { compare, report } from "./module-compare";\n\n`);

	uniqueImports.forEach((name) => {
		const moduleName = name.replace(/[\.\/\-]/g, '_');
		const compatName = `module_${moduleName}_compat`;
		const coreName = `module_${moduleName}_core`;
		output.push(`import * as ${coreName} from "@nativescript/core/${name}";`);
		output.push(`import * as ${compatName} from "tns-core-modules/${name}";`);
		output.push(`compare("${name}", ${coreName}, ${compatName});\n`);
	});

	output.push(`\n`);
	output.push(`report();`);

	const testFilePath = path.resolve('dist/generated-tests/tests.ts');
	ensureDirectoryExistence(testFilePath);

	fs.writeFileSync(testFilePath, output.join('\n'), 'utf8');
	(<any>fs).copyFileSync(path.resolve('build/generated-compat-checks/module-compare.ts'), path.resolve('dist/generated-tests/module-compare.ts'));

	console.log(`Compat tests generated: ${testFilePath}`);
}

function generateExportsForPrivateModules() {
	privateModulesWhitelist.forEach((pathNoExt) => {
		createReExportFile(pathNoExt, '.ts');
		addTestImport(pathNoExt);
	});
}

(async () => {
	console.log(' ------> GENERATING FILES FORM PACKAGE.JSON');
	// Traverse all package.json files and create:
	//  * .ts file with re-exports for the package.json/main
	//  * .d.ts file with re-exports for the package.json/types
	await traverseInputDir(['package.json'], processPackageJsonFile);

	console.log(' ------> GENERATING FILES FORM DEFINITIONS');
	// Traverse all d.ts files and create
	//  * .d.ts file with re-exports for definitions for the .d.ts
	//  * .ts file with re-exports for the corresponding ts/js file (is such exists)
	await traverseInputDir(['*.d.ts'], processDefinitionFile);

	console.log(' ------> GENERATING FILES FROM TYPESCRIPT');
	// Traverse all ts files which are not platform specific and create
	//  * .ts file with re-exports for the corresponding ts file
	await traverseInputDir(['*(?<!.(d|android|ios)).ts'], processTypeScriptFile);

	generateExportsForPrivateModules();

	// Generate tests in
	generateTestFile();
})().catch((e) => {
	console.log('Error generating tns-core-modules files: ' + e);
});
