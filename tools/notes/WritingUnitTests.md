# Writing Unit Tests

Unit tests are standard `*.spec.ts` files colocated with the source they cover, throughout the packages in this workspace (e.g. `packages/core/xml/index.spec.ts` next to `packages/core/xml/index.ts`). They are written with [Vitest](https://vitest.dev) and run per package through Nx.

## Running Tests

Refer to the [development-workflow guide](DevelopmentWorkflow.md) for repo setup. Then run a package's test target:

```bash
npx nx run core:test

# watch mode
npx nx run core:test --watch

# isolate tests by describe/it name
npx nx run core:test -t 'XmlParser'
```

Packages with a `test` target (such as `core` and `vite`) each define their Vitest configuration in their own `vite.config.ts` / `vitest.config.ts`.

## Writing Tests

Use the standard Vitest API — `describe`, `it`/`test`, `expect`, `beforeEach`, `vi` for mocking. Globals are enabled, so imports from `vitest` are optional:

```typescript
import { Observable } from '.';

describe('Observable', () => {
	it('notifies a listener once', () => {
		const observable = new Observable();
		let callCount = 0;

		observable.once('test', () => callCount++);
		observable.notify({ eventName: 'test', object: observable });
		observable.notify({ eventName: 'test', object: observable });

		expect(callCount).toBe(1);
	});
});
```

Async tests are plain `async` functions — return or await your promises and assert on the results.

## Test Environment

Tests run in Node, not on a device. `packages/core/vitest.setup.ts` stubs the NativeScript platform globals (`__IOS__`, `__ANDROID__`, `__UNIT_TEST__`, minimal `NSObject`-style mocks, etc.) so core modules can load, but real iOS/Android APIs are not available. If your test needs more of the native surface, extend the mocks in that setup file.

Behavior that depends on the actual native runtime belongs in the e2e suite instead — see the `apps/automated` app and the [development-workflow guide](DevelopmentWorkflow.md#running-the-e2e-test-apps).
