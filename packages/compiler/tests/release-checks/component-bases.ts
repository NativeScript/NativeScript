#!/usr/bin/env node
// A component extending a class, run by run.ts: the flattened classes behave as the classes did, translate, and what
// flattening cannot give stops the build.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { angularComponent } from '../../src/angular.ts';
import { flattenComponent, refuseBaseUses } from '../../src/component-bases.ts';
import { CoreKotlin } from '../../src/core-kotlin.ts';
import { Translator } from '../../src/kotlin.ts';
import { translateKotlinModules } from '../../src/kotlin-modules.ts';
import { translateModules } from '../../src/modules.ts';
import { createProgram } from '../../src/program.ts';
import { Translator as SwiftTranslator } from '../../src/swift.ts';

const here = dirname(fileURLToPath(import.meta.url));
const modulesDir = process.env.NS_DIFF_MODULES ?? resolve(here, '../node_modules');
let failed = 0;
const check = (ok: boolean, what: string) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) failed++;
};

{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-extends-'));
  try {
    const files: Record<string, string> = {
      'base.component.ts': `import { Component, Input } from '@angular/core';
export const PREFIX = 'hi ';
@Component({ selector: 'Base', template: '<Label [text]="title"></Label>' })
export class Base {
  @Input() title = 'base';
  count = 1;
  label = 'b';
  private static last = '';
  constructor() {
    this.label = this.label + '!';
  }
  greet(): string {
    return PREFIX + this.title;
  }
  ngOnInit(): void {
    this.count = 10;
  }
  close(): string {
    Base.last = this.label;
    return Base.last;
  }
}
`,
      'mid.component.ts': `import { Component } from '@angular/core';
import { Base } from './base.component';
@Component({ selector: 'Mid', template: '<Label [text]="greet()"></Label>' })
export class Mid extends Base {
  label = 'm';
  override greet(): string {
    return super.greet() + ' mid';
  }
  override ngOnInit(): void {
    super.ngOnInit();
    this.count++;
  }
}
`,
      'leaf.component.ts': `import { Component } from '@angular/core';
import { Mid as Middle } from './mid.component';
@Component({ selector: 'Leaf', template: '<StackLayout><Label [text]="title"></Label><Label [text]="count"></Label><Label [text]="greet()"></Label><Label [text]="close()"></Label></StackLayout>' })
export class Leaf extends Middle {
  extra = this.count + 1;
  constructor() {
    super();
    this.count = this.count + 4;
  }
  override greet(): string {
    return super.greet() + ' leaf';
  }
}
`,
      'card.component.ts': `import { Component, Input } from '@angular/core';
import { Base } from './base.component';
@Component({ selector: 'Card', template: '<Label [text]="size"></Label>' })
export class Card extends Base {
  @Input() title: string;
  count: number;
  size = this.label.length;
}
`,
      'sized.ts': `export abstract class Sized {
  protected readonly unit = 10;
  abstract label(): string;
  width(): number {
    return this.unit * 2;
  }
}
`,
      'box.component.ts': `import { Component } from '@angular/core';
import { Sized } from './sized';
@Component({ selector: 'Box', template: '<Label [text]="label()" [width]="width()"></Label>' })
export class Box extends Sized {
  label(): string {
    return 'box ' + this.width();
  }
}
`,
      'store.ts': `import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class Store {
  value = 3;
}
`,
      'keeper.ts': `import { Store } from './store';
export abstract class Keeper {
  ready = '';
  constructor(protected store: Store, tag: string) {
    this.ready = tag + this.store.value;
  }
}
`,
      'shelf.component.ts': `import { Component } from '@angular/core';
import { Keeper } from './keeper';
import { Store } from './store';
@Component({ selector: 'Shelf', template: '<Label [text]="ready"></Label>' })
export class Shelf extends Keeper {
  shown = 'shelf';
  constructor(store: Store) {
    super(store, 'shelf');
    this.shown = this.ready + '!';
  }
}
`,
    };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    const at = (f: string) => join(dir, f);
    // Under Node, the flattened classes behave as the classes they were: the same fields and results.
    const stub = "exports.Component = () => (c) => c; exports.Input = () => () => {}; exports.Injectable = () => (c) => c;\n";
    const behaviour = (flat: boolean) => {
      const out = join(dir, flat ? 'flat' : 'orig');
      mkdirSync(join(out, 'node_modules', '@angular', 'core'), { recursive: true });
      writeFileSync(join(out, 'node_modules', '@angular', 'core', 'index.js'), stub);
      for (const [f, text] of Object.entries(files)) {
        const name = /export (?:abstract )?class (\w+)/.exec(text)![1];
        const source = (flat && flattenComponent(at(f), text, name)) || text;
        writeFileSync(join(out, f.replace(/\.ts$/, '.js')), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true, useDefineForClassFields: false } }).outputText);
      }
      const load = createRequire(join(out, 'x.js'));
      const fields = (o: object) => JSON.stringify(Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')).sort(([a], [b]) => a.localeCompare(b))));
      const leaf = new (load('./leaf.component.js').Leaf)();
      const before = fields(leaf);
      leaf.ngOnInit();
      const mid = new (load('./mid.component.js').Mid)();
      mid.ngOnInit();
      const box = new (load('./box.component.js').Box)();
      const card = new (load('./card.component.js').Card)();
      const shelf = new (load('./shelf.component.js').Shelf)(new (load('./store.js').Store)());
      return [before, fields(leaf), leaf.greet(), leaf.close(), fields(mid), mid.greet(), box.label(), fields(shelf), fields(card)].join(' | ');
    };
    const [orig, flat] = [behaviour(false), behaviour(true)];
    check(orig === flat, `a flattened component chain behaves as its classes did under Node${orig === flat ? '' : `:\n    ${orig}\n    ${flat}`}`);
    const irs = ['base', 'mid', 'leaf', 'box', 'shelf', 'card'].map((n) => angularComponent(at(`${n}.component.ts`), files[`${n}.component.ts`], new Map())!);
    const leafIr = irs[2];
    check(!/\bextends\b|\bsuper\b/.test(leafIr.source.slice(leafIr.source.indexOf('export class Leaf'))), 'a component three levels down keeps no extends or super');
    check(leafIr.props.includes('title') && leafIr.init === 'ngOnInit', "a subclass's template binds an inherited input, and its inherited ngOnInit runs");
    const infos = new Map(irs.map((ir) => [ir.name, { props: ir.props, optional: ir.optional }]));
    const roots = Object.keys(files).map(at);
    const virtual = new Map(irs.map((ir) => [at(`${ir.name.toLowerCase()}.component.ts`), ir.source]));
    for (const platform of ['ios', 'android'] as const) {
      const { checker, program, files: pf } = createProgram(roots, virtual, platform, modulesDir);
      const cls = (n: string) => program.getSourceFile(at(`${n.toLowerCase()}.component.ts`))!.statements.filter(ts.isClassDeclaration).find((c) => c.name?.text === n)!;
      let members: (n: string) => string;
      if (platform === 'ios') {
        const sw = new SwiftTranslator(checker, infos, pf);
        sw.plainFields = true;
        translateModules(sw, program, roots);
        members = (n) => sw.componentMembers(cls(n), infos.get(n)!.props).join('\n');
      } else {
        const kt = new Translator(checker, infos, pf);
        kt.appModule = 'org.example.app';
        kt.plainFields = true;
        kt.core = new CoreKotlin(kt, false);
        translateKotlinModules(kt, program, roots);
        members = (n) => kt.componentMembers(cls(n), infos.get(n)!.props).lines.join('\n');
      }
      const [self, leaf, mid, box, shelf, card] = [platform === 'ios' ? 'self' : 'this', members('Leaf'), members('Mid'), members('Box'), members('Shelf'), members('Card')];
      const name = platform === 'ios' ? 'Swift' : 'Kotlin';
      check(/fun greet\(\)|func greet\(\)/.test(leaf) && leaf.includes(`return ${self}._super_Mid_greet() + " leaf"`) && /(func|fun) _super_Mid_greet\(\)[^]*_super_Base_greet\(\) \+ " mid"/.test(leaf), `super.greet() through three levels calls each base's copy (${name})`);
      check(/(func|fun) ngOnInit\(\) \{\s*\S+\._super_Base_ngOnInit\(\)/.test(mid) && /(func|fun) _super_Base_ngOnInit\(\)/.test(leaf), `an overridden ngOnInit calling super.ngOnInit() (${name})`);
      check(/_Mid_ready[^]*extra/.test(leaf) && /(func|fun) _init_Mid\(\)/.test(leaf), `the base constructors run before the field initializers that read them (${name})`);
      check(/(func|fun) width\(\)/.test(box) && /unit/.test(box), `a component extending an abstract plain class has its members (${name})`);
      check(/_init_Keeper\(store, "shelf"\)/.test(shelf), `super(…) arguments reach the base constructor (${name})`);
      check(/_Base_ready[^]*size/.test(card), `a component without a constructor runs its base's before its own field initializers (${name})`);
    }
    // What the copy cannot be: refused, wherever an app file asks for it.
    const components = Object.keys(files).map(at);
    const refused = (code: string) => {
      writeFileSync(at('use.ts'), `import { Base } from './base.component';\nimport { Mid } from './mid.component';\nimport { Sized } from './sized';\nimport { Component, Directive, inject, Inject, ViewChild } from '@angular/core';\n${code}\n`);
      try { refuseBaseUses([...components, at('use.ts')]); return ''; } catch (e) { return String(e); }
    };
    check(refused('export function shown(): string { return Base.name + new Base().greet(); }') === '', "a base class's statics and its own instances are not refused");
    for (const [code, what] of [
      ['export const isBase = (x: unknown) => x instanceof Base;', 'instanceof Base'],
      ['export const isSized = (x: unknown) => x instanceof Sized;', 'instanceof Sized'],
      ['export class Svc { mid = inject(Mid); }', 'inject(Mid)'],
      ['export class Svc { constructor(@Inject(Mid) private m: any) {} }', '@Inject(Mid)'],
      ["@Directive({ selector: '[x]', providers: [{ provide: Base, useValue: null }] }) export class X {}", 'Base as a provider (provide)'],
      ["@Component({ selector: 'P', template: '' }) export class P { @ViewChild(Mid) m: any; }", 'a query by Mid'],
      ['export function first(xs: Base[]): Base { return xs[0]; }', 'Base as a type'],
    ]) {
      const e = refused(code);
      check(e.includes(what) && e.includes('a class the component') && e.includes('not supported in a release build yet'), `${what} stops the build: ${e ? e.split(': ').slice(1).join(': ') : 'it compiled'}`);
    }
    const flatThrown = (sub: string, base = files['base.component.ts']) => {
      writeFileSync(at('b2.component.ts'), base);
      try { flattenComponent(at('s2.component.ts'), sub, 'S'); return ''; } catch (e) { return String(e); }
    };
    const sub = (body: string) => `import { Component } from '@angular/core';\nimport { Base } from './b2.component';\nimport { Store } from './store';\n@Component({ selector: 'S', template: '' })\nexport class S extends Base {\n${body}\n}\n`;
    for (const [e, what] of [
      [flatThrown(sub('constructor() { const x = 1; super(); }')), 'super(…) other than as the first statement'],
      [flatThrown(sub('label(): string { return "x"; }')), "S.label, a method over Base's field"],
      [flatThrown(sub('read(): number { return super.count; }')), 'super.count, where Base has no method or accessor count'],
      [flatThrown(sub(''), files['base.component.ts'].replace("selector: 'Base',", "selector: 'Base', providers: [Store],")), 'the providers of Base'],
      [flatThrown(sub('copy = this.ready;\nconstructor(store: Store) { super(store, "t"); }'), files['keeper.ts'].replace('export abstract class Keeper', 'export class Base')), "S's field initializers reading this, with super(…) given its constructor's parameter"],
    ]) check(e.includes(what) && e.includes('not supported in a release build yet'), `${what} stops the build: ${e ? e.split(': ').slice(1).join(': ') : 'it compiled'}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// A component's statics, and those it inherits from a component it extends, read through it as JavaScript reads them.
{
  const dir = mkdtempSync(join(tmpdir(), 'ns-release-checks-statics-'));
  try {
    const files: Record<string, string> = {
      'dialog.component.ts': `import { Component } from '@angular/core';
@Component({ selector: 'Dialog', template: '<Label [text]="name"></Label>' })
export class Dialog {
  static readonly kind = 'dialog';
  static opened = 0;
  private static secret = 's';
  static get title(): string {
    return 'T' + Dialog.opened + Dialog.secret;
  }
  static open(n: number, tag = '!'): string {
    Dialog.opened += n;
    return Dialog.kind + Dialog.opened + tag;
  }
  static make(): string {
    return this.kind;
  }
  name = 'd';
}
`,
      'confirm.component.ts': `import { Component } from '@angular/core';
import { Dialog } from './dialog.component';
@Component({ selector: 'Confirm', template: '<Label [text]="describe()"></Label>' })
export class Confirm extends Dialog {
  static get label(): string {
    return Confirm.kind + ':' + Confirm.title;
  }
  static set label(v: string) {
    Confirm.open(v.length);
  }
  describe(): string {
    return Confirm.open(1) + ' ' + Confirm.title + ' ' + Confirm.label;
  }
}
`,
    };
    for (const [f, text] of Object.entries(files)) writeFileSync(join(dir, f), text);
    const at = (f: string) => join(dir, f);
    const stub = 'exports.Component = () => (c) => c;\n';
    const behaviour = (flat: boolean) => {
      const out = join(dir, flat ? 'flat' : 'orig');
      mkdirSync(join(out, 'node_modules', '@angular', 'core'), { recursive: true });
      writeFileSync(join(out, 'node_modules', '@angular', 'core', 'index.js'), stub);
      for (const [f, text] of Object.entries(files)) {
        const name = /export class (\w+)/.exec(text)![1];
        const source = (flat && flattenComponent(at(f), text, name)) || text;
        writeFileSync(join(out, f.replace(/\.ts$/, '.js')), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true, useDefineForClassFields: false } }).outputText);
      }
      const load = createRequire(join(out, 'x.js'));
      const { Confirm } = load('./confirm.component.js');
      const { Dialog } = load('./dialog.component.js');
      const shown = new Confirm().describe();
      Confirm.label = 'abc';
      return [shown, Confirm.kind, Confirm.title, Confirm.label, Confirm.open(2, '?'), Dialog.opened].join(' | ');
    };
    const [orig, flat] = [behaviour(false), behaviour(true)];
    check(orig === flat, `inherited statics read through a flattened component behave as under Node${orig === flat ? '' : `:\n    ${orig}\n    ${flat}`}`);
    const irs = ['dialog', 'confirm'].map((n) => angularComponent(at(`${n}.component.ts`), files[`${n}.component.ts`], new Map())!);
    const infos = new Map(irs.map((ir) => [ir.name, { props: ir.props, optional: ir.optional }]));
    const roots = Object.keys(files).map(at);
    const virtual = new Map(irs.map((ir) => [at(`${ir.name.toLowerCase()}.component.ts`), ir.source]));
    for (const platform of ['ios', 'android'] as const) {
      const { checker, program, files: pf } = createProgram(roots, virtual, platform, modulesDir);
      const errors = ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error && roots.includes(d.file?.fileName ?? ''));
      check(!errors.length, `inherited statics read through a flattened component type-check (${platform})${errors.length ? ': ' + ts.flattenDiagnosticMessageText(errors[0].messageText, ' ') : ''}`);
      const cls = program.getSourceFile(at('confirm.component.ts'))!.statements.filter(ts.isClassDeclaration).find((c) => c.name?.text === 'Confirm')!;
      if (platform === 'ios') {
        const sw = new SwiftTranslator(checker, infos, pf);
        sw.plainFields = true;
        translateModules(sw, program, roots);
        const m = sw.componentMembers(cls, infos.get('Confirm')!.props).join('\n');
        check(/static var title: String/.test(m) && /static var label: String \{[^]*set/.test(m) && /static func `open`\(/.test(m), 'a component\'s static accessors and its base\'s statics (Swift)');
      } else {
        const kt = new Translator(checker, infos, pf);
        kt.appModule = 'org.example.app';
        kt.plainFields = true;
        kt.core = new CoreKotlin(kt, false);
        translateKotlinModules(kt, program, roots);
        let statics = '';
        try { statics = kt.componentMembers(cls, infos.get('Confirm')!.props).statics.join('\n'); } catch (e) { statics = String(e); }
        check(/val title: String\s+get\(\)/.test(statics) && /var label: String\s+get\(\)[^]*set\(v\)/.test(statics) && /fun open\(/.test(statics), `a component's static accessors and its base's statics (Kotlin)${/^Error/.test(statics) ? ': ' + statics : ''}`);
      }
    }
    const refused = (code: string) => {
      writeFileSync(at('use.ts'), `import { Confirm } from './confirm.component';\nimport { Dialog } from './dialog.component';\n${code}\n`);
      try { refuseBaseUses([...roots, at('use.ts')]); return ''; } catch (e) { return String(e); }
    };
    check(refused('export const shown = Confirm.kind + Confirm.title + Confirm.open(1) + Dialog.make(); Dialog.opened = 2;') === '', 'inherited statics read through a component, and the base\'s written, are not refused');
    for (const [code, what] of [
      ['export function reset() { Confirm.opened = 0; }', 'writing Confirm.opened, a static field the component Confirm inherits from Dialog'],
      ['export function bump() { Confirm.opened++; }', 'writing Confirm.opened'],
      ['export const made = Confirm.make();', 'Confirm.make, a static method of Dialog reading this'],
    ]) {
      const e = refused(code);
      check(e.includes(what) && e.includes('not supported in a release build yet'), `${what} stops the build: ${e ? e.split(': ').slice(1).join(': ') : 'it compiled'}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

process.exit(failed ? 1 : 0);
