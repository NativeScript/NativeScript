// Centralized regex constants shared by the websocket server plugin
// Exported to avoid any ordering/scope issues during TS builds and to keep definitions in one place.

// Generic query suffix
export const QUERY_PATTERN = /\?.*$/;

// Detect whether Vite's variable dynamic import helper is already inlined
export const VARIABLE_DYNAMIC_IMPORT_HELPER_PATTERN = /__variableDynamicImportRuntimeHelper\s*=/;

// Import/export matchers (static and dynamic)
//
// Each pattern's first capture group includes the optional leading anchor
// (`^|\n`) so the replacement function preserves the line break that would
// otherwise be silently consumed by the regex engine. Without this, two
// concatenated patterns like:
//   `})();\nexport * from "a"\nexport * from "b"`
// would collapse to:
//   `})();export * from "a"export * from "b"`
// because each `(?:^|\n)` ate a newline that no replacement string put back.
export const IMPORT_PATTERN_1 = /((?:^|\n)\s*import\s+[^'";]*?\s+from\s+["'])([^"']+)(["'];?)/g;
export const IMPORT_PATTERN_2 = /((?:^|\n)\s*export\s+[^'";]*?\s+from\s+["'])([^"']+)(["'];?)/g;
export const EXPORT_PATTERN = IMPORT_PATTERN_2;
export const IMPORT_PATTERN_3 = /(import\(\s*["'])([^"']+)(["']\s*\))/g;
// Side-effect imports: import "spec" / import 'spec' (no `from`, no bindings)
export const IMPORT_PATTERN_SIDE_EFFECT = /((?:^|\n)\s*import\s+["'])([^"']+)(["'];?)/g;

// Vue-specific patterns
export const VUE_FILE_PATTERN = /\.vue(?:\?[^"']*)?$/;
export const VUE_FILE_IMPORT = /((?:^|\n)\s*import\s+[^'";]*?\s+from\s+["'])([^"']+\.vue(?:\?[^"']*)?)(["'];?)/g;

// Vite/HMR noise cleanup
export const VITE_CLIENT_IMPORT = /(?:^|\n)\s*import\s+['"](?:\/@vite\/client|@vite\/client)['"];?/g;
// Strip Vite's injected `import.meta.hot = __vite__createHotContext(...)` assignment.
// Important: it may appear mid-line after other tokens/spaces in sanitized HTTP output,
// so we cannot rely on it starting at BOL.
export const IMPORT_META_HOT_ASSIGNMENT = /\bimport\.meta\.hot\s*=\s*[^;\n]+;?/g;
export const IMPORT_META_HOT_CALLS = /(?:^|\n)\s*import\.meta\.hot\.[A-Za-z_$][\w$]*\([^)]*\);?\s*/g;

// Remove only Vue style virtual imports; keep script/template variants
export const VUE_STYLE_IMPORTS = /(?:^|\n)\s*import\s+['"][^'"\n]*\.vue\?type=style[^'"\n]*['"];?/g;
export const VUE_EXPORT_SFC_IMPORT = /(?:^|\n)\s*import\s+[^;\n]*__vite-plugin-vue_export-helper[^;\n]*;?/g;
export const VUE_VIRTUAL_ID_IMPORT = /(?:^|\n)\s*import\s+[^;\n]*\/@id\/[^'"\n]*;?/g;
