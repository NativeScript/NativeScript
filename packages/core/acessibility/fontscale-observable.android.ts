import * as Application from '../application';
import { Observable } from '../data/observable';
import { FontScaleObservableBase, getClosestValidFontScale } from './fontscale-observable-common';

let internalObservable: Observable;
function fontScaleChanged(origFontScale: number) {
  const fontScale = getClosestValidFontScale(origFontScale);

  internalObservable.set(FontScaleObservable.FONT_SCALE, fontScale);
}

function useAndroidFontScale() {
  fontScaleChanged(Number(Application.android.context.getResources().getConfiguration().fontScale));
}

function setupConfigListener() {
  Application.off(Application.launchEvent, setupConfigListener);

  const context = Application.android && (Application.android.context as android.content.Context);

  if (!context) {
    Application.on(Application.launchEvent, setupConfigListener);

    return;
  }

  useAndroidFontScale();

  const configChangedCallback = new android.content.ComponentCallbacks2({
    onLowMemory() {
      // Dummy
    },
    onTrimMemory() {
      // Dummy
    },
    onConfigurationChanged(newConfig: android.content.res.Configuration) {
      fontScaleChanged(Number(newConfig.fontScale));
    },
  });

  context.registerComponentCallbacks(configChangedCallback);
  Application.on(Application.resumeEvent, useAndroidFontScale);
}

export class FontScaleObservable extends FontScaleObservableBase {
	protected _setupNativeObservable(): Observable {
		if (!internalObservable) {
			internalObservable = new Observable();
			setupConfigListener();
		}

		return internalObservable;
	}
}
