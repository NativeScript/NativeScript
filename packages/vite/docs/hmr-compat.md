# HMR compat shims (experimental)

`@nativescript/vite/hmr-compat` keeps app code written for the pre-thin HMR client running while it moves to `import.meta.hot`. Import it first in the app entry:

```ts
import '@nativescript/vite/hmr-compat';
```

It defines these globals, each warning once with its replacement. Everything sits inside `if (import.meta.hot)`, so release and webpack builds get nothing.

| Global | Shim | Replacement |
|---|---|---|
| `__NS_HOT_REGISTRY__` | `on`/`off` forward to this module's `import.meta.hot`; `dispatchHotEvent` dispatches to every device listener. Listeners are never pruned. | `import.meta.hot.on/off` in the owning module, cleaned up on `nativescript:beforeRerun` |
| `__NS_HMR_ON_UPDATE__` | An app-set hook, called once per update (after `vite:afterUpdate`, so after a soft reboot's `nativescript:afterReboot`) with `{ type: 'delta', version, changedIds, raw }` | `import.meta.hot.on('vite:afterUpdate')` or `nativescript:afterReboot` |
| `__NS_DEV_ORIGIN__` | The dev-server origin | `new URL(import.meta.url).origin` inside `if (import.meta.hot)` |
| `__NS_HTTP_ORIGIN__` | Not shimmed: the dev runtime still sets it | same as above |

The Angular globals (`__NS_NG_HMR__`, `__reboot_ng_modules__`, …), route and dialog restore and `HmrCacheService` come from `provideNativeScriptHmrCompat()` in `@nativescript/angular` (branch `experiment/vite-hmr-compat`).

The full mapping, with the exact warning texts and the known gaps, is the migration guide: [`docs/vite-hmr-migration.md` in NativeScript/angular](https://github.com/NativeScript/angular/blob/experiment/vite-hmr-compat/docs/vite-hmr-migration.md).

The Angular fixture (`tools/vite-server-env-spike/apps/ng`) uses both. `refresh-fixture-packages.sh` installs `@nativescript/angular` from the `vite-hmr-compat` worktree's `dist` by default on this branch; override it with `NS_ANGULAR_DIST`.
