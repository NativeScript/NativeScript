import * as path from "path";

export class FileSystemAccess {
    public getPathSeparator(): string {
        return path.sep;
    }
}