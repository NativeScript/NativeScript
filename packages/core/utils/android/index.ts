import { Application } from '../../application';
import { Trace } from '../../trace';
import { topmost } from '../../ui/frame/frame-stack';

let application: android.app.Application;
let applicationContext: android.content.Context;
let contextResources: android.content.res.Resources;
let packageName: string;

export function getApplicationContext(): android.content.Context {
  if (!applicationContext) {
    applicationContext = getApplication().getApplicationContext();
  }
  return applicationContext;
}

export function getCurrentActivity(): android.app.Activity | null {
  if (!Application.android) {
    return null;
  }
  return Application.android.foregroundActivity || Application.android.startActivity;
}

export function getApplication(): android.app.Application {
  if (!application) {
    application = Application.android.getNativeApplication();
  }
  return application;
}

export function getResources(): android.content.res.Resources {
  if (!contextResources) {
    contextResources = getApplication().getResources();
  }
  return contextResources;
}

export function getPackageName(): string {
  if (!packageName) {
    packageName = getApplicationContext().getPackageName();
  }
  return packageName;
}

let inputMethodManager: android.view.inputmethod.InputMethodManager;

export function getInputMethodManager(): android.view.inputmethod.InputMethodManager {
  if (!inputMethodManager) {
    inputMethodManager = <android.view.inputmethod.InputMethodManager>(
      getApplicationContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE)
    );
  }
  return inputMethodManager;
}

export function showSoftInput(nativeView: android.view.View): void {
  const inputManager = getInputMethodManager();
  if (inputManager && nativeView instanceof android.view.View) {
    inputManager.showSoftInput(nativeView, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
  }
}

export function dismissSoftInput(nativeView?: android.view.View): void {
  const inputManager = getInputMethodManager();
  let windowToken: android.os.IBinder | null = null;

  if (nativeView instanceof android.view.View) {
    if (!nativeView.hasFocus()) {
      return;
    }
    windowToken = nativeView.getWindowToken();
  } else {
    const currentActivity = getCurrentActivity();
    if (currentActivity instanceof androidx.appcompat.app.AppCompatActivity) {
      const currentTopmost = topmost();
      const modalDialog =
        (currentTopmost?._modalParent ?? (currentTopmost?.modal as any))?._dialogFragment?.getDialog();
      const window = modalDialog ?? currentActivity.getWindow();
      const decorView = window.getDecorView();
      if (decorView) {
        windowToken = decorView.getWindowToken();
        decorView.requestFocus();
      }
    }
  }

  if (inputManager && windowToken) {
    inputManager.hideSoftInputFromWindow(windowToken, 0);
  }
}

export namespace collections {
  export function stringArrayToStringSet(str: string[]): java.util.HashSet<string> {
    const hashSet = new java.util.HashSet<string>();
    if (str !== undefined) {
      for (const element of str) {
        hashSet.add('' + element);
      }
    }
    return hashSet;
  }

  export function stringSetToStringArray(stringSet: java.util.Set<string>): string[] {
    const arr: string[] = [];
    if (stringSet !== undefined) {
      const it = stringSet.iterator();
      while (it.hasNext()) {
        const element = '' + it.next();
        arr.push(element);
      }
    }
    return arr;
  }
}

export namespace resources {
  let attr: any;
  const attrCache = new Map<string, number>();

  export function getDrawableId(name: string): number {
    return getId(':drawable/' + name);
  }

  export function getStringId(name: string): number {
    return getId(':string/' + name);
  }

  export function getId(name: string): number {
    const resources = getResources();
    const packageName = getPackageName();
    const uri = packageName + name;
    return resources.getIdentifier(uri, null, null);
  }

  export function getResource(name: string, type?: string): number {
    return getResources().getIdentifier(name, type || null, getPackageName());
  }

  export function getPaletteColor(name: string, context: android.content.Context): number {
    if (attrCache.has(name)) {
      return attrCache.get(name) as number;
    }

    let result = 0;
    try {
      if (!attr) {
        attr = java.lang.Class.forName('androidx.appcompat.R$attr');
      }

      let colorID = 0;
      const field = attr.getField(name);
      if (field) {
        colorID = field.getInt(null);
      }

      if (colorID) {
        const typedValue = new android.util.TypedValue();
        context.getTheme().resolveAttribute(colorID, typedValue, true);
        result = typedValue.data;
      }
    } catch (ex) {
      Trace.write(`Cannot get palette color: ${name} - ${ex}`, Trace.categories.Error, Trace.messageType.error);
    }

    attrCache.set(name, result);
    return result;
  }
}

export function isRealDevice(): boolean {
  const fingerprint = android.os.Build.FINGERPRINT || '';
  return (
    fingerprint !== '' &&
    !(
      fingerprint.toLowerCase().includes('vbox') ||
      fingerprint.toLowerCase().includes('generic') ||
      fingerprint.toLowerCase().includes('emulator')
    )
  );
}
