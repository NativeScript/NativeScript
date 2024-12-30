'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const path_1 = require('path');
const ts = require('typescript');
const fs = require('fs');
const { relative, join } = require('path');

/**
 * Custom resolver which will respect package exports (until Jest supports it natively
 * by resolving https://github.com/facebook/jest/issues/9771)
 */
const enhancedResolver = require('enhanced-resolve').create.sync({
  conditionNames: ['require', 'node', 'default'],
  extensions: ['.js', '.json', '.node', '.ts', '.tsx'],
});

function getCompilerSetup(rootDir) {
  const tsConfigPath =
    ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.spec.json') ||
    ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.test.json') ||
    ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.jest.json');
  if (!tsConfigPath) {
    console.error(
      `Cannot locate a tsconfig.spec.json. Please create one at ${rootDir}/tsconfig.spec.json`
    );
  }
  const readResult = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  const config = ts.parseJsonConfigFileContent(
    readResult.config,
    ts.sys,
    path_1.dirname(tsConfigPath)
  );
  const compilerOptions = config.options;
  const host = ts.createCompilerHost(compilerOptions, true);
  return { compilerOptions, host };
}
let compilerSetup;

if (
  process.argv[1].indexOf('jest-worker') > -1 ||
  (process.argv.length >= 4 && process.argv[3].split(':')[1] === 'test')
) {
  const root = path_1.join(__dirname, '..', 'tmp', 'unit');
  try {
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root);
    }
  } catch (_err) {}
  process.env.NX_WORKSPACE_ROOT_PATH = root;
}

module.exports = function (path, options) {
  if (path === 'jest-sequencer-@jest/test-sequencer') return;
  const ext = path_1.extname(path);
  if (
    ext === '.css' ||
    ext === '.scss' ||
    ext === '.sass' ||
    ext === '.less' ||
    ext === '.styl'
  ) {
    return require.resolve('identity-obj-proxy');
  }
  // Try to use the defaultResolver
  try {
    // powerpack packages are installed via npm and resolved like any other packages
    if (path.startsWith('@nx/') && !path.startsWith('@nx/powerpack-')) {
      throw new Error('custom resolution');
    }
    if (path.startsWith('nx/')) throw new Error('custom resolution');

    if (path.indexOf('@nx/workspace') > -1) {
      throw new Error(
        'Reference to local Nx package found. Use local version instead.'
      );
    }

    // Global modules which must be resolved by defaultResolver
    if (['child_process', 'fs', 'http', 'path'].includes(path)) {
      return options.defaultResolver(path, options);
    }

    return enhancedResolver(path_1.resolve(options.basedir), path);
  } catch (e) {
    // Fallback to using typescript
    compilerSetup = compilerSetup || getCompilerSetup(options.rootDir);
    const { compilerOptions, host } = compilerSetup;
    const name = ts.resolveModuleName(
      path,
      join(options.basedir, 'fake-placeholder.ts'),
      compilerOptions,
      host
    ).resolvedModule.resolvedFileName;
    if (name.startsWith('..')) {
      return path_1.join(options.rootDir, name);
    } else {
      return name;
    }
  }
};