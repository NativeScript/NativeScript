import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { inlineDecoratorComponentTemplates } from './inline-decorator-component-templates.js';

describe('inlineDecoratorComponentTemplates', () => {
	it('inlines templateUrl for decorator-only component emit', () => {
		const projectRoot = mkdtempSync(join(tmpdir(), 'ns-inline-component-'));
		mkdirSync(join(projectRoot, 'src/app'), { recursive: true });
		writeFileSync(join(projectRoot, 'src/app/app.component.html'), '<GridLayout><Label text="Hello" /></GridLayout>');

		const input = `
//#region src/app/app.component.ts
var AppComponent = class AppComponent {
};
AppComponent = __decorate([
    Component({ selector: "hk-app", templateUrl: "./app.component.html" })
], AppComponent);
//#endregion
`;

		const output = inlineDecoratorComponentTemplates(input, { projectRoot });

		expect(output).toContain('template: "<GridLayout><Label text=\\"Hello\\" /></GridLayout>"');
		expect(output).not.toContain('templateUrl: "./app.component.html"');
	});

	it('inlines templateUrl for aliased component decorator names', () => {
		const projectRoot = mkdtempSync(join(tmpdir(), 'ns-inline-component-'));
		mkdirSync(join(projectRoot, 'src/app'), { recursive: true });
		writeFileSync(join(projectRoot, 'src/app/app.component.html'), '<Label text="Aliased" />');

		const input = `
//#region src/app/app.component.ts
var AppComponent = class AppComponent {
};
AppComponent = __decorate([
    Component$2({ selector: "hk-app", templateUrl: "./app.component.html" })
], AppComponent);
//#endregion
`;

		const output = inlineDecoratorComponentTemplates(input, { projectRoot });

		expect(output).toContain('template: "<Label text=\\"Aliased\\" />"');
		expect(output).not.toContain('templateUrl: "./app.component.html"');
	});

	it('normalizes region paths that append a ts module suffix', () => {
		const projectRoot = mkdtempSync(join(tmpdir(), 'ns-inline-component-'));
		mkdirSync(join(projectRoot, 'src/app/caregiver'), { recursive: true });
		writeFileSync(join(projectRoot, 'src/app/caregiver/caregiver-chat-list.component.html'), '<Label text="Caregiver" />');

		const input = `
//#region src/app/caregiver/caregiver-chat-list.component.ts/caregiver-chat-list.component.ts
var CaregiverChatListComponent = class CaregiverChatListComponent {
};
CaregiverChatListComponent = __decorate([
	    Component({ selector: "caregiver-chat-list", templateUrl: \`./caregiver-chat-list.component.html\` })
], CaregiverChatListComponent);
//#endregion
`;

		const output = inlineDecoratorComponentTemplates(input, { projectRoot });

		expect(output).toContain('template: "<Label text=\\"Caregiver\\" />"');
		expect(output).not.toContain('templateUrl: `./caregiver-chat-list.component.html`');
	});

	it('prefers the exact region path when the source file lives in a .ts directory', () => {
		const projectRoot = mkdtempSync(join(tmpdir(), 'ns-inline-component-'));
		mkdirSync(join(projectRoot, 'src/app/caregiver/caregiver-chat-list.component.ts'), { recursive: true });
		writeFileSync(join(projectRoot, 'src/app/caregiver/caregiver-chat-list.component.ts/caregiver-chat-list.component.html'), '<Label text="Nested" />');

		const input = `
//#region src/app/caregiver/caregiver-chat-list.component.ts/caregiver-chat-list.component.ts
var CaregiverChatListComponent = class CaregiverChatListComponent {
};
CaregiverChatListComponent = __decorate([
	    Component({ selector: "caregiver-chat-list", templateUrl: \`./caregiver-chat-list.component.html\` })
], CaregiverChatListComponent);
//#endregion
`;

		const output = inlineDecoratorComponentTemplates(input, { projectRoot });

		expect(output).toContain('template: "<Label text=\\"Nested\\" />"');
		expect(output).not.toContain('templateUrl: \`./caregiver-chat-list.component.html\`');
	});

	it('inlines styleUrls into styles for decorator-only component emit', () => {
		const projectRoot = mkdtempSync(join(tmpdir(), 'ns-inline-component-'));
		mkdirSync(join(projectRoot, 'src/app/component.ts'), { recursive: true });
		writeFileSync(join(projectRoot, 'src/app/component.ts/component.css'), '.foo { color: red; }');

		const input = `
//#region src/app/component.ts/component.ts
var StyledComponent = class StyledComponent {
};
StyledComponent = __decorate([
	    Component({ selector: "styled-component", styleUrls: ["./component.css"] })
], StyledComponent);
//#endregion
`;

		const output = inlineDecoratorComponentTemplates(input, { projectRoot });

		expect(output).toContain('styles: [".foo { color: red; }"]');
		expect(output).not.toContain('styleUrls: ["./component.css"]');
	});

	it('leaves the decorator unchanged when the template file is missing', () => {
		const projectRoot = mkdtempSync(join(tmpdir(), 'ns-inline-component-'));

		const input = `
//#region src/app/app.component.ts
var AppComponent = class AppComponent {
};
AppComponent = __decorate([
    Component({ selector: "hk-app", templateUrl: "./app.component.html" })
], AppComponent);
//#endregion
`;

		expect(inlineDecoratorComponentTemplates(input, { projectRoot })).toBe(input);
	});
});
