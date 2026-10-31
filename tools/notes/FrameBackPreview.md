# Experimental Android Frame back preview

`Frame.beginBackPreview()` creates a presentation-only snapshot session on Android 14+. It does not register a system Back callback, invoke guards, or navigate. On iOS, unsupported/busy Frames and unsupported content, it returns `undefined`.

```ts
const preview = frame.beginBackPreview({ onDispose: releaseGestureState });
preview?.update(progress, edge); // 'left', 'right', or 'none'
preview?.cancel();             // restore presentation without changing history

// After release: the app/router still owns the decision to leave.
if (preview && await preview.finish() && preview.active) {
  if (await mayLeave()) {
    if (preview.active) frame.goBack();
  } else {
    preview.cancel();
  }
}
```

`finish()` resolves false if interrupted. A true result only means its exit animation finished. It does not reserve or pop an entry; callers must recheck their navigation/guard state. Frame disposes the preview when navigation starts, it unloads/detaches, or its native view is disposed. `dispose()` is synchronous and idempotent. Only one preview per Frame is active.

The previous native Page remains detached and unloaded. A noninteractive, accessibility-hidden ImageView shows a software-drawn snapshot behind the live current Page. This avoids driving Fragment lifecycle during progress/cancellation or migrating Frame's logical history to FragmentManager back-stack transactions.

Tradeoffs:

- Capture is synchronous and allocates width × height × 4 bytes, bounded to 4,194,304 pixels / 16 MiB. `snapshotBytes` reports the allocated buffer, zero after disposal. Capture cost is device/content dependent; this is not a claim of improved frame rates.
- The previous Page's preview is static. SurfaceView/TextureView descendants, secure windows, custom/shared transitions and failed software drawing decline the session. The caller decides whether to keep its existing preview or fall back to ordinary Back.
- Existing custom navigation transitions remain untouched. The prototype deliberately does not attempt to seek arbitrary animators or Android framework transitions.
- A modal inner Frame can preview its own previous Page. Root dismissal and predictive back-to-home remain with the dialog/Activity owner.

`apps/toolbox/src/pages/back-preview.ts` is a standalone native example: navigate to that page, push, preview/cancel/finish, or recreate the Activity while previewing. `apps/automated/src/ui/frame/frame-tests.android.ts` covers Page ownership and navigation after Activity recreation. The router investigation contains a system-input driver, comparison screenshots, lifecycle traces, native bitmap collection and Android 14/15/16 acceptance: https://github.com/rafaelaugustos/vue-router-ns/issues/62.

Recreation also exposed an existing Frame readiness bug: a newly created Activity can attach the Frame view while its lifecycle is INITIALIZED. The early attach check declines navigation, but no second attachment arrives after CREATED. Rechecking an attached view in `onLoaded()`, against its owning Activity, restores the queue without bypassing the lifecycle guard.

Proposal: https://github.com/NativeScript/NativeScript/issues/11557.
