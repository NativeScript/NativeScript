import { describe, expect, it } from 'vitest';

import { synthesizeMissingInjectableFactories } from './synthesize-injectable-factories.js';

describe('synthesizeMissingInjectableFactories', () => {
	it('adds factory and provider metadata for zero-arg injectables', () => {
		const input = `
var TaskEffects = class TaskEffects {
};
TaskEffects = __decorate([
    Injectable(),
    __decorateMetadata("design:paramtypes", [])
], TaskEffects);
`;

		const output = synthesizeMissingInjectableFactories(input);

		expect(output.indexOf('Object.defineProperty(TaskEffects, "ɵfac"')).toBeLessThan(output.indexOf('TaskEffects = __decorate'));
		expect(output).toContain('Object.defineProperty(TaskEffects, "ɵfac", { value: function TaskEffects_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TaskEffects)(); }, configurable: true, writable: true });');
		expect(output).toContain('Object.defineProperty(TaskEffects, "ɵprov", { value: /* @__PURE__ */ ({ token: TaskEffects, providedIn: null, factory: TaskEffects.ɵfac, value: undefined }), configurable: true, writable: true });');
	});

	it('adds injected constructor args and providedIn metadata', () => {
		const input = `
import { yr as Injectable } from "./vendor.mjs";
var ChildService = class ChildService {
};
ChildService = __decorate([
    Injectable({ providedIn: "root" }),
    __decorateMetadata("design:paramtypes", [HttpClient, Store])
], ChildService);
`;

		const output = synthesizeMissingInjectableFactories(input, { vendorInjectExport: 'Br' });

		expect(output).toContain('import { Br as __nsInject } from "./vendor.mjs";');
		expect(output).toContain('Object.defineProperty(ChildService, "ɵfac", { value: function ChildService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChildService)(__nsInject(HttpClient), __nsInject(Store)); }, configurable: true, writable: true });');
		expect(output).toContain('Object.defineProperty(ChildService, "ɵprov", { value: /* @__PURE__ */ ({ token: ChildService, providedIn: "root", factory: ChildService.ɵfac, value: undefined }), configurable: true, writable: true });');
	});

	it('adds zero-arg metadata for inject()-field services without design:paramtypes metadata', () => {
		const input = `
var ChildrenEffects = class ChildrenEffects {
  nativeDialog = inject(NativeDialogService);
  store = inject(Store);
};
ChildrenEffects = __decorate([
    Injectable()
], ChildrenEffects);
`;

		const output = synthesizeMissingInjectableFactories(input);

		expect(output.indexOf('Object.defineProperty(ChildrenEffects, "ɵfac"')).toBeLessThan(output.indexOf('ChildrenEffects = __decorate'));
		expect(output).toContain('Object.defineProperty(ChildrenEffects, "ɵfac", { value: function ChildrenEffects_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChildrenEffects)(); }, configurable: true, writable: true });');
		expect(output).toContain('Object.defineProperty(ChildrenEffects, "ɵprov", { value: /* @__PURE__ */ ({ token: ChildrenEffects, providedIn: null, factory: ChildrenEffects.ɵfac, value: undefined }), configurable: true, writable: true });');
	});

	it('adds zero-arg metadata for inherited inject()-field services with synthetic rest constructors', () => {
		const input = `
var GlobalErrorHandler = class GlobalErrorHandler extends ErrorHandler {
  constructor(..._args) {
    super(..._args);
    this.injector = inject(Injector);
  }
};
GlobalErrorHandler = __decorate([
    Injectable()
], GlobalErrorHandler);
`;

		const output = synthesizeMissingInjectableFactories(input);

		expect(output.indexOf('Object.defineProperty(GlobalErrorHandler, "ɵfac"')).toBeLessThan(output.indexOf('GlobalErrorHandler = __decorate'));
		expect(output).toContain('Object.defineProperty(GlobalErrorHandler, "ɵfac", { value: function GlobalErrorHandler_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || GlobalErrorHandler)(); }, configurable: true, writable: true });');
		expect(output).toContain('Object.defineProperty(GlobalErrorHandler, "ɵprov", { value: /* @__PURE__ */ ({ token: GlobalErrorHandler, providedIn: null, factory: GlobalErrorHandler.ɵfac, value: undefined }), configurable: true, writable: true });');
	});

	it('adds metadata for predeclared var assignment emit shapes', () => {
		const input = `
var TimerService;
var init_time_service = __esmMin(() => {
  TimerService = class TimerService {
    constructor() {
      this._timers = {};
    }
  };
  TimerService = __decorate([
      Injectable({ providedIn: "root" })
  ], TimerService);
});
`;

		const output = synthesizeMissingInjectableFactories(input);

		expect(output.indexOf('Object.defineProperty(TimerService, "ɵfac"')).toBeLessThan(output.indexOf('TimerService = __decorate'));
		expect(output).toContain('Object.defineProperty(TimerService, "ɵfac", { value: function TimerService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TimerService)(); }, configurable: true, writable: true });');
		expect(output).toContain('Object.defineProperty(TimerService, "ɵprov", { value: /* @__PURE__ */ ({ token: TimerService, providedIn: "root", factory: TimerService.ɵfac, value: undefined }), configurable: true, writable: true });');
	});

	it('does not duplicate metadata that already exists', () => {
		const input = `
var ChildService = class ChildService {
};
ChildService = __decorate([
    Injectable({ providedIn: "root" }),
    __decorateMetadata("design:paramtypes", [HttpClient])
], ChildService);
ChildService.ɵfac = function ChildService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ChildService)(__nsInject(HttpClient)); };
ChildService.ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({ token: ChildService, factory: ChildService.ɵfac, providedIn: "root" });
`;

		expect(synthesizeMissingInjectableFactories(input)).toBe(input);
	});

	it('replaces Angular JIT getter metadata without throwing', () => {
		const input = `
var SessionStorageService = class SessionStorageService {
  constructor() {
    this.appUsageKey = "appUsageCount";
  }
};
SessionStorageService = __decorate([
    Injectable({ providedIn: "root" }),
    __decorateMetadata("design:paramtypes", [])
], SessionStorageService);
`;

		const output = synthesizeMissingInjectableFactories(input);
		const createService = new Function('Injectable', '__decorate', '__decorateMetadata', 'inject', `${output}\nreturn SessionStorageService;`);

		const Injectable = (meta: unknown) => (type: any) => {
			if (!Object.prototype.hasOwnProperty.call(type, 'ɵfac')) {
				Object.defineProperty(type, 'ɵfac', {
					get: () => 'jit-factory',
					configurable: true,
				});
			}
			if (!Object.prototype.hasOwnProperty.call(type, 'ɵprov')) {
				Object.defineProperty(type, 'ɵprov', {
					get: () => ({ token: type, factory: 'jit-provider', meta }),
				});
			}
			return type;
		};

		const __decorate = (decorators: Array<(target: any) => any>, target: any) => {
			let result = target;
			for (let index = decorators.length - 1; index >= 0; index--) {
				const decorator = decorators[index];
				result = decorator(result) ?? result;
			}
			return result;
		};

		const __decorateMetadata = () => () => undefined;
		const inject = (token: unknown) => token;

		const SessionStorageService = createService(Injectable, __decorate, __decorateMetadata, inject) as any;

		expect(output.indexOf('Object.defineProperty(SessionStorageService, "ɵprov"')).toBeLessThan(output.indexOf('SessionStorageService = __decorate'));
		expect(typeof SessionStorageService.ɵfac).toBe('function');
		expect(SessionStorageService.ɵprov).toEqual({
			token: SessionStorageService,
			providedIn: 'root',
			factory: SessionStorageService.ɵfac,
			value: undefined,
		});
		expect(SessionStorageService.ɵfac()).toBeInstanceOf(SessionStorageService);
	});

	it('ignores decorated classes that are not injectables', () => {
		const input = `
var ListComponent = class ListComponent {
};
ListComponent = __decorate([
    Component({ selector: "list-view" }),
    __decorateMetadata("design:paramtypes", [Store])
], ListComponent);
`;

		expect(synthesizeMissingInjectableFactories(input)).toBe(input);
	});
});
