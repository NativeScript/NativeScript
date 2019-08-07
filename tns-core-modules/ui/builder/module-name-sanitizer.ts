export function sanitizeModuleName(moduleName: string, removeExtension: boolean = true): string {
    moduleName = moduleName.trim();

    if (moduleName.startsWith("~/")) {
        moduleName = moduleName.substring(2);
    } else if (moduleName.startsWith("~")) {
        moduleName = moduleName.substring(1);
    } else if (moduleName.startsWith("/")) {
        moduleName = moduleName.substring(1);
    }

    if (removeExtension) {
        const lastDot = moduleName.lastIndexOf(".");
        if (lastDot > 0) {
            moduleName = moduleName.substr(0, lastDot);
        }
    }

    return moduleName;
}