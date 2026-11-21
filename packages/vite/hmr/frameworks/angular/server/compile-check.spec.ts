import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { verifyAngularComponentOutput } from './compile-check.js';

const UNCOMPILED = `let HomeComponent = class HomeComponent {};
HomeComponent = __decorate([Component({ selector: 'Home', templateUrl: './home.component.html' })], HomeComponent);
export { HomeComponent };
`;
const COMPILED = `export class HomeComponent { static ɵcmp = i0.ɵɵdefineComponent({ type: HomeComponent }); }`;

describe('verifyAngularComponentOutput', () => {
	// Inside the workspace, so the component resolves `@angular/compiler` as an app would.
	let dir: string;
	let componentFile: string;
	const source = `@Component({ selector: 'Home', templateUrl: './home.component.html' })\nexport class HomeComponent {}\n`;

	beforeEach(() => {
		dir = fs.mkdtempSync(path.join(import.meta.dirname, '.compile-check-'));
		componentFile = path.join(dir, 'home.component.ts');
		fs.writeFileSync(componentFile, source);
	});

	afterEach(() => {
		fs.rmSync(dir, { recursive: true, force: true });
	});

	it('passes a compiled component and anything that is not a component', async () => {
		fs.writeFileSync(path.join(dir, 'home.component.html'), '<Label text="ok"></Label>');
		expect(await verifyAngularComponentOutput({ id: componentFile, code: COMPILED })).toBeUndefined();
		expect(await verifyAngularComponentOutput({ id: componentFile, code: UNCOMPILED }, async () => 'export const notAComponent = 1;\n')).toBeUndefined();
		expect(await verifyAngularComponentOutput({ id: '/app/node_modules/lib/x.ts', code: UNCOMPILED }, async () => source)).toBeUndefined();
	});

	it('rejects the uncompiled decorator with the template error and its position', async () => {
		fs.writeFileSync(path.join(dir, 'home.component.html'), `<StackLayout>\n\t<Label [text]="'Taps: ' + count("></Label>\n</StackLayout>\n`);
		const error = (await verifyAngularComponentOutput({ id: componentFile, code: UNCOMPILED })) as Error & { id?: string; loc?: { file: string; line: number; column: number }; plugin?: string };
		expect(error).toBeInstanceOf(Error);
		expect(error.message).toMatch(/^Angular could not compile the component in home\.component\.ts: /);
		expect(error.id).toBe(path.join(dir, 'home.component.html'));
		expect(error.loc).toEqual(expect.objectContaining({ file: path.join(dir, 'home.component.html'), line: 2 }));
		expect(error.plugin).toBe('nativescript:angular-compile-check');
	});

	it('still rejects when the template parses, without a position', async () => {
		fs.writeFileSync(path.join(dir, 'home.component.html'), '<Label text="ok"></Label>');
		const error = (await verifyAngularComponentOutput({ id: componentFile, code: UNCOMPILED })) as Error & { loc?: unknown };
		expect(error.message).toBe('Angular could not compile the component in home.component.ts; check its template and decorator metadata');
		expect(error.loc).toBeUndefined();
	});
});
