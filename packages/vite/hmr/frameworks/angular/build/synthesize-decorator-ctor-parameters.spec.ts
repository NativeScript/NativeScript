import { describe, expect, it } from 'vitest';

import { synthesizeDecoratorCtorParameters } from './synthesize-decorator-ctor-parameters.js';

describe('synthesizeDecoratorCtorParameters', () => {
	it('adds lazy ctorParameters for decorator-only Angular classes with param metadata', () => {
		const input = `
var _ref, _ref2;
var AppComponent = class AppComponent {
};
AppComponent = __decorate([
    Component$2({ selector: "hk-app" }),
    __decorateMetadata("design:paramtypes", [typeof (_ref = typeof DeepLinkService !== "undefined" && DeepLinkService) === "function" ? _ref : Object, typeof (_ref2 = typeof NgZone !== "undefined" && NgZone) === "function" ? _ref2 : Object])
], AppComponent);
`;

		const output = synthesizeDecoratorCtorParameters(input);

		expect(output.indexOf('AppComponent.ctorParameters = () =>')).toBeLessThan(output.indexOf('AppComponent = __decorate'));
		expect(output).toContain('AppComponent.ctorParameters = () => [{ type: typeof (_ref = typeof DeepLinkService !== "undefined" && DeepLinkService) === "function" ? _ref : Object }, { type: typeof (_ref2 = typeof NgZone !== "undefined" && NgZone) === "function" ? _ref2 : Object }];');
	});

	it('matches aliased __decorate helpers from bundled output', () => {
		const input = `
var _ref;
var TasksService = class TasksService {
};
TasksService = __decorate$8([
    Injectable({ providedIn: "root" }),
    __decorateMetadata("design:paramtypes", [typeof (_ref = typeof HttpClient !== "undefined" && HttpClient) === "function" ? _ref : Object])
], TasksService);
`;

		const output = synthesizeDecoratorCtorParameters(input);

		expect(output).toContain('TasksService.ctorParameters = () => [{ type: typeof (_ref = typeof HttpClient !== "undefined" && HttpClient) === "function" ? _ref : Object }];');
		expect(output.indexOf('TasksService.ctorParameters = () =>')).toBeLessThan(output.indexOf('TasksService = __decorate$8'));
	});

	it('evaluates ctorParameters lazily', () => {
		const source = synthesizeDecoratorCtorParameters(`
var _ref;
let DeepLinkService;
class NgZone {}
var AppComponent = class AppComponent {
};
AppComponent = __decorate([
    Component({ selector: "hk-app" }),
    __decorateMetadata("design:paramtypes", [typeof (_ref = typeof DeepLinkService !== "undefined" && DeepLinkService) === "function" ? _ref : Object, NgZone])
], AppComponent);
DeepLinkService = class DeepLinkService {};
`);

		const evaluated = new Function('Component', '__decorate', '__decorateMetadata', `${source}\nreturn { AppComponent, DeepLinkService, NgZone };`);

		const result = evaluated(
			() => (type: any) => type,
			(_decorators: unknown[], target: unknown) => target,
			() => () => undefined,
		) as any;

		expect(result.AppComponent.ctorParameters()[0].type).toBe(result.DeepLinkService);
		expect(result.AppComponent.ctorParameters()[1].type).toBe(result.NgZone);
	});
});
