import ts from 'typescript';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  lookupClass, lookupConstant, lookupConstructor, lookupEnum, lookupFunction, lookupInit, lookupMember, lookupStruct, lookupTypealias, nativeTable,
  type NativeMethod, type NativeProperty,
} from './symbols.ts';

/** How much of a module's `@nativescript/types-ios` declarations the native table maps, by kind. */

const COMPILER = fileURLToPath(new URL('../..', import.meta.url));

function typesDir(): string {
  const tail = join('node_modules', '@nativescript', 'types-ios', 'lib', 'ios', 'objc-x86_64');
  const candidates = [join(process.cwd(), tail), join(COMPILER, tail)];
  const release = join(COMPILER, '..');
  for (const d of readdirSync(release)) candidates.push(join(release, d, tail));
  const found = candidates.find((c) => existsSync(c));
  if (!found) throw new Error('@nativescript/types-ios not found');
  return found;
}

/** NSObject methods Swift does not import (reference counting, `class`). */
const ARC = new Set(['class', 'retainCount', 'retain', 'release', 'autorelease', 'zone']);

interface Tally { total: number; missing: string[] }

export function verify(module: string) {
  const file = join(typesDir(), `objc!${module}.d.ts`);
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, false);
  const started = Date.now();
  nativeTable(module);
  const loaded = Date.now() - started;
  const kinds = ['classes', 'instance members', 'static members', 'constructors', 'init methods', 'enum members', 'functions', 'constants', 'structs', 'struct fields', 'arity'] as const;
  const tally = Object.fromEntries(kinds.map((k) => [k, { total: 0, missing: [] } as Tally])) as Record<(typeof kinds)[number], Tally>;
  /** Members of classes Swift does not import at all are counted apart: there is no Swift spelling to find. */
  const unimported = { members: 0, arc: 0 };
  let owner = '';
  const count = (kind: (typeof kinds)[number], name: string, ok: unknown) => {
    if (kind !== 'classes' && kind !== 'arity' && owner && !lookupClass(module, owner)) {
      unimported.members++;
      return;
    }
    tally[kind].total++;
    if (!ok) tally[kind].missing.push(name);
  };

  const vars = new Map<string, ts.TypeNode | undefined>();
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) vars.set(d.name.getText(sf), d.type);
  }
  const protocolStatics = (name: string) => {
    const t = vars.get(name);
    return t && ts.isTypeLiteralNode(t) && t.members.some((m) => m.name?.getText(sf) === 'prototype') ? t : null;
  };
  const isStructVar = (name: string) => /^interop\.StructType</.test(vars.get(name)?.getText(sf) ?? '');

  /** Whether the JavaScript arguments line up with the Swift parameters plus the `NSError **` one. */
  const arity = (owner: string, name: string, decl: ts.SignatureDeclarationBase, m: NativeMethod | NativeProperty | null) => {
    if (!m || m.kind === 'property') return;
    const js = decl.parameters.length;
    const native = m.params.filter((t) => t !== '()').length + (m.throws ? 1 : 0);
    count('arity', `${owner}.${name}: ${js} JS vs ${native} Swift (${m.selector})`, js === native);
  };

  const members = (owner: string, list: readonly ts.TypeElement[] | readonly ts.ClassElement[], forceStatic = false) => {
    for (const m of list) {
      const name = m.name?.getText(sf);
      const isStatic = forceStatic || !!ts.getCombinedModifierFlags(m as ts.Declaration) && (ts.getCombinedModifierFlags(m as ts.Declaration) & ts.ModifierFlags.Static) !== 0;
      if (ts.isConstructorDeclaration(m)) {
        const param = m.parameters[0]?.type;
        if (!param || !ts.isTypeLiteralNode(param)) continue;
        const keys = param.members.map((x) => x.name!.getText(sf));
        count('constructors', `${owner}({ ${keys.join(', ')} })`, lookupConstructor(module, owner, keys));
        continue;
      }
      // `readonly` without a type is a generator artifact in some types-ios classes.
      if (!name || name.startsWith('[') || name === 'prototype' || name === 'readonly' || isStatic && name === 'alloc') continue;
      if (!isStatic && ARC.has(name)) { unimported.arc++; continue; }
      const isMethod = ts.isMethodDeclaration(m) || ts.isMethodSignature(m);
      if (isMethod && !isStatic && /^init/.test(name) && m.type?.getText(sf) === 'this') {
        const found = lookupInit(module, owner, name);
        count('init methods', `${owner}.${name}`, found);
        arity(owner, name, m, found);
        continue;
      }
      const found = lookupMember(module, owner, name, isStatic);
      count(isStatic ? 'static members' : 'instance members', `${owner}${isStatic ? '.' : '#'}${name}`, found);
      if (isMethod) arity(owner, name, m, found);
    }
  };

  for (const st of sf.statements) {
    owner = '';
    if (ts.isClassDeclaration(st) && st.name) {
      const name = st.name.text;
      count('classes', name, lookupClass(module, name));
      owner = name;
      members(name, st.members);
    } else if (ts.isInterfaceDeclaration(st)) {
      const name = st.name.text;
      if (isStructVar(name)) {
        const s = lookupStruct(module, name);
        count('structs', name, s);
        for (const f of st.members) count('struct fields', `${name}.${f.name!.getText(sf)}`, s?.fields[f.name!.getText(sf)]);
        continue;
      }
      const statics = protocolStatics(name);
      if (!statics) continue;
      count('classes', name, lookupClass(module, name));
      owner = name;
      members(name, st.members);
      members(name, statics.members, true);
    } else if (ts.isEnumDeclaration(st)) {
      const e = lookupEnum(module, st.name.text);
      for (const m of st.members) {
        // Swift has no case for an option set's zero member: it is `[]`.
        const zeroOption = e?.kind === 'options' && m.initializer?.getText(sf) === '0';
        count('enum members', `${st.name.text}.${m.name.getText(sf)}`, e?.cases[m.name.getText(sf)] || zeroOption);
      }
    } else if (ts.isFunctionDeclaration(st) && st.name) {
      const f = lookupFunction(module, st.name.text);
      count('functions', st.name.text, f);
      if (f) {
        const native = f.labels.length + (f.self !== undefined ? 1 : 0);
        count('arity', `${st.name.text}: ${st.parameters.length} JS vs ${native} Swift`, st.parameters.length === native);
      }
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const name = d.name.getText(sf);
        if (protocolStatics(name) || isStructVar(name)) continue;
        count('constants', name, lookupConstant(module, name));
      }
    }
  }

  console.log(`\n${module}  (table loaded or generated in ${loaded} ms)`);
  for (const k of kinds) {
    const t = tally[k];
    if (!t.total) continue;
    const mapped = t.total - t.missing.length;
    console.log(`  ${k.padEnd(17)} ${String(mapped).padStart(6)} / ${String(t.total).padEnd(6)} ${(100 * mapped / t.total).toFixed(1)}%`);
  }
  if (unimported.members) console.log(`  (${unimported.members} members of the unmapped classes not counted)`);
  if (unimported.arc) console.log(`  (${unimported.arc} uses of NSObject's ${[...ARC].join('/')}, unavailable in Swift, not counted)`);
  for (const k of kinds) {
    const t = tally[k];
    if (!t.missing.length) continue;
    console.log(`  unmapped ${k} (${t.missing.length}):`);
    for (const n of t.missing.slice(0, 40)) console.log(`    ${n}`);
  }
}

export function check() {
  const show = (label: string, value: unknown) => console.log(`${label}\n  ${JSON.stringify(value)}`);
  show('UIImage.systemImageNamed', lookupMember('UIKit', 'UIImage', 'systemImageNamed', true));
  show('UIImage.systemImageNamedWithConfiguration', lookupMember('UIKit', 'UIImage', 'systemImageNamedWithConfiguration', true));
  show('UIImageSymbolConfiguration.configurationWithPointSizeWeight', lookupMember('UIKit', 'UIImageSymbolConfiguration', 'configurationWithPointSizeWeight', true));
  show('class UIImageSymbolConfiguration', { swift: lookupClass('UIKit', 'UIImageSymbolConfiguration')?.swift, base: lookupClass('UIKit', 'UIImageSymbolConfiguration')?.base });
  show('enum UIImageSymbolWeight (Bold)', pick(lookupEnum('UIKit', 'UIImageSymbolWeight'), 'Bold'));
  show('enum UIViewContentMode (ScaleAspectFit)', pick(lookupEnum('UIKit', 'UIViewContentMode'), 'ScaleAspectFit'));
  show('UIViewController#presentViewControllerAnimatedCompletion', lookupMember('UIKit', 'UIViewController', 'presentViewControllerAnimatedCompletion', false));
  show('UIView.alloc().initWithFrame', lookupInit('UIKit', 'UIView', 'initWithFrame'));
  show('new UIView({ frame })', lookupConstructor('UIKit', 'UIView', ['frame']));
  show('new UIButton({ frame })', lookupConstructor('UIKit', 'UIButton', ['frame']));
  show('UIView.new', lookupMember('UIKit', 'UIView', 'new', true));
  show('UIColor.redColor', lookupMember('UIKit', 'UIColor', 'redColor', true));
  show('UIColor.labelColor', lookupMember('UIKit', 'UIColor', 'labelColor', true));
  show('UIColor#CGColor', lookupMember('UIKit', 'UIColor', 'CGColor', false));
  show('UIView#hidden', lookupMember('UIKit', 'UIView', 'hidden', false));
  show('CGRectMake', lookupFunction('CoreGraphics', 'CGRectMake'));
  show('CGSizeMake', lookupFunction('CoreGraphics', 'CGSizeMake'));
  show('CGRectGetWidth', lookupFunction('CoreGraphics', 'CGRectGetWidth'));
  show('CGRectZero', lookupConstant('CoreGraphics', 'CGRectZero'));
  show('struct CGRect', lookupStruct('CoreFoundation', 'CGRect'));
  show('NSFontAttributeName', lookupConstant('UIKit', 'NSFontAttributeName'));
  show('UIFontTextStyleBody', lookupConstant('UIKit', 'UIFontTextStyleBody'));
  show('UIFontWeightBold', lookupConstant('UIKit', 'UIFontWeightBold'));
  show('typed constants UIFontWeight', summarize(lookupEnum('UIKit', 'UIFontWeight')));
  show('typed constants NSAttributedStringKey', summarize(lookupEnum('UIKit', 'NSAttributedStringKey')));
  show('UIFont.systemFontOfSizeWeight', lookupMember('UIKit', 'UIFont', 'systemFontOfSizeWeight', true));
  show('UIView#layer', lookupMember('UIKit', 'UIView', 'layer', false));
  show('CALayer#cornerRadius', lookupMember('QuartzCore', 'CALayer', 'cornerRadius', false));
  show('UIView.animateWithDurationAnimations', lookupMember('UIKit', 'UIView', 'animateWithDurationAnimations', true));
  show('NSFileManager#contentsOfDirectoryAtPathError', lookupMember('Foundation', 'NSFileManager', 'contentsOfDirectoryAtPathError', false));
  show('new NSKeyedUnarchiver({ forReadingFromData })', lookupConstructor('Foundation', 'NSKeyedUnarchiver', ['forReadingFromData']));
  show('CGPointMake', lookupFunction('CoreGraphics', 'CGPointMake'));
  show('NSMakeRange', lookupFunction('Foundation', 'NSMakeRange'));
  show('UIEdgeInsetsMake', lookupFunction('UIKit', 'UIEdgeInsetsMake'));
  show('UIAccessibilityIsVoiceOverRunning', lookupFunction('UIKit', 'UIAccessibilityIsVoiceOverRunning'));
  show('UIAction.actionWithHandler (overlay initializer, defaults omitted)', lookupMember('UIKit', 'UIAction', 'actionWithHandler', true));
  show('NSArray.arrayWithArray (factory dropped for init(array:))', lookupMember('Foundation', 'NSArray', 'arrayWithArray', true));
  show('options UIViewAutoresizing', pick(lookupEnum('UIKit', 'UIViewAutoresizing'), 'FlexibleWidth'));
  show('typealias TimeInterval', lookupTypealias('Foundation', 'TimeInterval'));
}

function pick(e: ReturnType<typeof lookupEnum>, member: string) {
  return e && { swift: e.swift, kind: e.kind, raw: e.raw, [member]: e.cases[member] };
}

function summarize(e: ReturnType<typeof lookupEnum>) {
  return e && { ...e, cases: `${Object.keys(e.cases).length} cases, e.g. ${JSON.stringify(Object.entries(e.cases).slice(0, 2))}` };
}
