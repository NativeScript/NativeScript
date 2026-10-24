// What a diff case's first lines say about how it is checked and translated, for every harness that runs the cases.
import { readFileSync } from 'node:fs';
import type { KotlinOptions, SwiftOptions } from '../native-build.ts';

const head = (file: string) => readFileSync(file, 'utf8');

/**
 * A case starting `// @lenient` is checked as core is, without strictNullChecks, and translated
 * as the kit generated from core is, lenient and in library mode (Swift only, as the kit is
 * generated for iOS first). One starting `// @lenient-kotlin` is translated so as Kotlin only,
 * as kit-gen-kotlin.ts generates kit-android; one starting `// @lenient-both` so as both.
 */
export const lenient = (file: string) => head(file).startsWith('// @lenient');
export const lenientBoth = (file: string) => head(file).startsWith('// @lenient-both');
export const kotlinOnly = (file: string) => head(file).startsWith('// @lenient-kotlin');
/** A case starting `// @kotlin` covers what only the Kotlin translator does yet: it is not run as Swift. */
export const kotlinApp = (file: string) => head(file).startsWith('// @kotlin');
/** A case starting `// @plugin` is a non-strict app whose imports from `helpers/plugin/` are a plugin's, compiled from its source (Swift only). */
export const pluginCase = (file: string) => head(file).startsWith('// @plugin');
/** A case starting `// @app-lenient` is a non-strict app's own code (`strict: false` in its tsconfig.json), on both targets. */
export const appLenient = (file: string) => head(file).startsWith('// @app-lenient');
/** A case starting `// @swift` covers what only the Swift runtime has yet (typed arrays): it is not run as Kotlin. */
export const swiftOnly = (file: string) => (lenient(file) && !kotlinOnly(file) && !lenientBoth(file)) || pluginCase(file) || head(file).startsWith('// @swift');

export const runsOn = (file: string, target: 'swift' | 'kotlin') => (target === 'swift' ? !kotlinOnly(file) && !kotlinApp(file) : !swiftOnly(file));

/** `// @weak-fields A.b C.d` and `// @weak-captures A.e` lines: what the kit's configuration holds weakly (tools/native-kit/modules.mts). */
export function weakOf(file: string) {
  const text = head(file);
  const list = (tag: string) => [...text.matchAll(new RegExp(`^// @${tag} (.+)$`, 'gm'))].flatMap((m) => m[1].trim().split(/\s+/));
  return { fields: list('weak-fields'), captures: list('weak-captures') };
}

/** A `// @forms-port` line: Node runs the case against runtime/angular-forms.ts, not @angular/forms (it drives the directives as a compiled template does). */
export const formsPortCase = (file: string) => /^\/\/ @forms-port$/m.test(head(file));

/** A `// @exit <n>` line: the status the case ends with when not 0. Node's run of a case declaring none must end with 0 and print something. */
export const expectedExit = (file: string) => Number(/^\/\/ @exit (\d+)$/m.exec(head(file))?.[1] ?? 0);

/** A `// @members-by-name` line: the case is translated as an XML app's code is, its classes' accessors and methods readable by name (core's Builder binds to them). */
export const membersByName = (file: string) => /^\/\/ @members-by-name$/m.test(head(file));

export const swiftOptions = (file: string): SwiftOptions => ({ lenient: lenient(file), weak: weakOf(file), membersByName: membersByName(file), plugin: pluginCase(file), lenientApp: appLenient(file) });
export const kotlinOptions = (file: string): KotlinOptions => ({ lenient: lenient(file), membersByName: membersByName(file), lenientApp: appLenient(file) });
