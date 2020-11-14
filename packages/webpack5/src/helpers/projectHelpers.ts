
import { existsSync } from "fs";
import { resolve } from "path";

export function getPackageJson(projectDir: string) {
    const packageJsonPath = getPackageJsonPath(projectDir);
    const result = readJsonFile(packageJsonPath);

    return result;
}

export function readJsonFile(filePath:string) {
    return require(filePath) as {
      main:string
      // to be extended?
    };
}

export function getPackageJsonPath  (projectDir: string) {
    const packagePath = resolve(projectDir, "package.json");
    if (existsSync(packagePath)) {
      return packagePath;
    } else {
      return getPackageJsonPath(resolve(projectDir, '..'));
    }
  
  }