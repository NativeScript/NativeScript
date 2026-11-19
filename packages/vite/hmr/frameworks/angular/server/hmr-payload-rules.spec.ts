import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

import { applyComponentUpdateRules, ComponentUpdateLedger, componentUpdateIdToFiles, decodeComponentUpdateId, hasOnlyHmrMetadataChanges, isRootComponentUpdate, normalizeWsSendArgs, parseNgComponentRequest } from './hmr-payload-rules.js';

const COMPONENT = `import { Component, signal } from '@angular/core';

@Component({
	selector: 'ns-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
	template: \`<Label text="a"></Label>\`,
	styles: [\`Label { color: red; }\`],
})
export class HomeComponent {
	count = signal(0);
}
`;

const id = (relativePath: string, className: string) => encodeURIComponent(`${relativePath}@${className}`);
const componentUpdate = (relativePath: string, className: string) => ({ type: 'custom', event: 'angular:component-update', data: { id: id(relativePath, className), timestamp: 1 } });

describe('decodeComponentUpdateId', () => {
	it('splits the encoded id on the last @', () => {
		expect(decodeComponentUpdateId(id('src/app/home/home.component.ts', 'HomeComponent'))).toEqual({ relativePath: 'src/app/home/home.component.ts', className: 'HomeComponent' });
		expect(decodeComponentUpdateId(id('libs/@scope/ui/button.component.ts', 'ButtonComponent'))).toEqual({ relativePath: 'libs/@scope/ui/button.component.ts', className: 'ButtonComponent' });
	});

	it('rejects empty or non-string ids', () => {
		expect(decodeComponentUpdateId('')).toBeNull();
		expect(decodeComponentUpdateId(undefined)).toBeNull();
	});
});

describe('componentUpdateIdToFiles', () => {
	it('resolves the id against every base, deduplicated', () => {
		const updateId = id('src/app/home/home.component.ts', 'HomeComponent');
		expect(componentUpdateIdToFiles(updateId, ['/repo/apps/demo', '/repo'])).toEqual(['/repo/apps/demo/src/app/home/home.component.ts', '/repo/src/app/home/home.component.ts']);
		expect(componentUpdateIdToFiles(updateId, ['/app', '/app'])).toEqual(['/app/src/app/home/home.component.ts']);
	});
});

describe('normalizeWsSendArgs', () => {
	it('accepts both send(event, data) and send(payload)', () => {
		expect(normalizeWsSendArgs(['angular:component-update', { id: 'x' }])).toEqual({ type: 'custom', event: 'angular:component-update', data: { id: 'x' } });
		const payload = { type: 'full-reload', path: '*' };
		expect(normalizeWsSendArgs([payload])).toBe(payload);
	});
});

describe('hasOnlyHmrMetadataChanges', () => {
	it('accepts template and style changes', () => {
		const next = COMPONENT.replace('<Label text="a">', '<Label text="b">').replace('color: red', 'color: blue').replace('home.component.css', 'home2.component.css');
		expect(hasOnlyHmrMetadataChanges(ts, COMPONENT, next)).toBe(true);
	});

	it('rejects a class body change', () => {
		expect(hasOnlyHmrMetadataChanges(ts, COMPONENT, COMPONENT.replace('signal(0)', 'signal(10)'))).toBe(false);
	});

	it('rejects other decorator properties and code outside the class', () => {
		expect(hasOnlyHmrMetadataChanges(ts, COMPONENT, COMPONENT.replace("'ns-home'", "'ns-home2'"))).toBe(false);
		expect(hasOnlyHmrMetadataChanges(ts, COMPONENT, COMPONENT + '\nexport const extra = 1;\n')).toBe(false);
	});

	it('treats a template field read from a variable as non-HMR metadata', () => {
		const source = `const template = '<Label></Label>';\n@Component({ template })\nexport class A {}\n`;
		expect(hasOnlyHmrMetadataChanges(ts, source, source.replace('<Label>', '<Button>'))).toBe(false);
	});

	it('is conservative without a previous version or TypeScript', () => {
		expect(hasOnlyHmrMetadataChanges(ts, undefined, COMPONENT)).toBe(false);
		expect(hasOnlyHmrMetadataChanges(null, COMPONENT, COMPONENT.replace('"a"', '"b"'))).toBe(false);
	});
});

describe('isRootComponentUpdate', () => {
	const root = { file: '/repo/src/app/app.component', className: 'AppComponent' };

	it('matches the root by file, whatever the source extension', () => {
		expect(isRootComponentUpdate(root, id('src/app/app.component.ts', 'AppComponent'), ['/repo'])).toBe(true);
		expect(isRootComponentUpdate(root, id('src/app/home/home.component.ts', 'HomeComponent'), ['/repo'])).toBe(false);
	});

	it('falls back to the class name when the id base resolves elsewhere', () => {
		expect(isRootComponentUpdate(root, id('apps/demo/src/app/app.component.ts', 'AppComponent'), ['/repo'])).toBe(true);
	});

	it('is false without a root', () => {
		expect(isRootComponentUpdate(null, id('src/app/app.component.ts', 'AppComponent'), ['/repo'])).toBe(false);
	});
});

describe('applyComponentUpdateRules', () => {
	const base = { idBases: ['/repo'], root: { file: '/repo/src/app/app.component', className: 'AppComponent' } };

	it('passes a component update without a class change', () => {
		const payload = componentUpdate('src/app/home/home.component.ts', 'HomeComponent');
		expect(applyComponentUpdateRules(payload, { ...base, hasClassChange: () => false })).toEqual({ payload });
	});

	it('turns a class-changed component update into a full reload', () => {
		const file = '/repo/src/app/home/home.component.ts';
		const result = applyComponentUpdateRules(componentUpdate('src/app/home/home.component.ts', 'HomeComponent'), { ...base, hasClassChange: (candidate: string) => candidate === file });
		expect(result).toEqual({ payload: { type: 'full-reload', path: '*', triggeredBy: file } });
	});

	it('turns a root component update into a full reload', () => {
		const result = applyComponentUpdateRules(componentUpdate('src/app/app.component.ts', 'AppComponent'), { ...base, hasClassChange: () => false });
		expect(result.payload).toEqual({ type: 'full-reload', path: '*', triggeredBy: '/repo/src/app/app.component.ts' });
	});

	it('leaves other payloads untouched', () => {
		const context = { ...base, hasClassChange: () => true };
		for (const payload of [{ type: 'update', updates: [] }, { type: 'full-reload', path: '*' }, { type: 'custom', event: 'other', data: { id: id('src/app/app.component.ts', 'AppComponent') } }, 'raw']) {
			expect(applyComponentUpdateRules(payload, context).payload).toBe(payload);
		}
	});
});

describe('parseNgComponentRequest', () => {
	it('reads the decoded id and the raw timestamp of a metadata fetch under any prefix', () => {
		const c = encodeURIComponent('src/app/home/home.component.ts@HomeComponent');
		expect(parseNgComponentRequest(`/ns/v/src/app/home/@ng/component?c=${c}&t=12`)).toEqual({ id: 'src/app/home/home.component.ts@HomeComponent', timestamp: '12' });
		expect(parseNgComponentRequest('/src/app/home/home.component.ts')).toBeNull();
	});
});

describe('ComponentUpdateLedger', () => {
	it('matches an id in either encoding against the latest timestamp only', () => {
		const ledger = new ComponentUpdateLedger();
		ledger.record({ id: encodeURIComponent('src/app/a.ts@A'), timestamp: 1 });
		ledger.record({ id: encodeURIComponent('src/app/a.ts@A'), timestamp: 2 });
		expect(ledger.isLive({ id: 'src/app/a.ts@A', timestamp: '2' })).toBe(true);
		expect(ledger.isLive({ id: 'src/app/a.ts@A', timestamp: '1' })).toBe(false);
		expect(ledger.isLive({ id: 'src/app/b.ts@B', timestamp: '2' })).toBe(false);
		expect(ledger.isLive({ id: 'src/app/a.ts@A', timestamp: '' })).toBe(false);
	});
});
