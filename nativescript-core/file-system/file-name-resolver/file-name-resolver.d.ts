import { PlatformContext } from "../../module-name-resolver/qualifier-matcher";

export class FileNameResolver {
    constructor(context: PlatformContext);
    resolveFileName(path: string, ext: string): string;
    clearCache(): void;
}

export function resolveFileName(path: string, ext: string): string;
export function clearCache(): void;
