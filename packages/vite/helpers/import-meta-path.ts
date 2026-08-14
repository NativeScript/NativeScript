import { fileURLToPath } from 'node:url';

type FileUrlToPathOptions = Parameters<typeof fileURLToPath>[1];

export function resolveRelativeToImportMeta(metaUrl: string, relativePath: string, options?: FileUrlToPathOptions): string {
	return fileURLToPath(new URL(relativePath, metaUrl), options);
}
