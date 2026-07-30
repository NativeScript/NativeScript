import path from 'path';
import fs from 'fs';

// Node.js-style module resolution: walk up directory tree looking for node_modules
export function findPackageInNodeModules(packageName: string, startDir: string) {
	let currentDir = startDir;
	while (currentDir !== path.dirname(currentDir)) {
		// Stop at filesystem root
		const nodeModulesDir = path.join(currentDir, 'node_modules');
		const packagePath = path.join(nodeModulesDir, packageName);

		if (fs.existsSync(packagePath)) {
			return packagePath;
		}

		// Move up one directory
		currentDir = path.dirname(currentDir);
	}
	return null;
}
