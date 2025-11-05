import { SDK_VERSION } from '../utils/constants';
import { getNativeApp, updateA11yPropertiesCallback } from './helpers-common';
import { AccessibilityRole, AccessibilityState } from '../accessibility/accessibility-common';
import { Trace } from '../trace';

let _startActivity: androidx.appcompat.app.AppCompatActivity;
let _foregroundActivity: androidx.appcompat.app.AppCompatActivity;

export function androidGetCurrentActivity(): androidx.appcompat.app.AppCompatActivity {
	return _foregroundActivity || _startActivity;
}
export function androidGetForegroundActivity(): androidx.appcompat.app.AppCompatActivity {
	return _foregroundActivity;
}
export function androidSetForegroundActivity(activity: androidx.appcompat.app.AppCompatActivity): void {
	_foregroundActivity = activity;
}
export function androidGetStartActivity(): androidx.appcompat.app.AppCompatActivity {
	return _startActivity;
}
export function androidSetStartActivity(activity: androidx.appcompat.app.AppCompatActivity): void {
	_startActivity = activity;
}

function getApplicationContext(): android.content.Context {
	return getNativeApp<android.app.Application>().getApplicationContext();
}

export function updateContentDescription(view: any /* View */, forceUpdate?: boolean): string | null {
	if (!view.nativeViewProtected) {
		return;
	}

	return applyContentDescription(view, forceUpdate);
}

export function applyContentDescription(view: any /* View */, forceUpdate?: boolean) {
	let androidView = view.nativeViewProtected as android.view.View;
	if (!androidView || (androidView instanceof android.widget.TextView && !view._androidContentDescriptionUpdated)) {
		return null;
	}

	if (androidView instanceof androidx.appcompat.widget.Toolbar) {
		const numChildren = androidView.getChildCount();

		for (let i = 0; i < numChildren; i += 1) {
			const childAndroidView = androidView.getChildAt(i);
			if (childAndroidView instanceof androidx.appcompat.widget.AppCompatTextView) {
				androidView = childAndroidView;
				break;
			}
		}
	}

	const cls = `applyContentDescription(${view})`;

	const titleValue = view['title'] as string;
	const textValue = view['text'] as string;

	if (!forceUpdate && view._androidContentDescriptionUpdated === false && textValue === view['_lastText'] && titleValue === view['_lastTitle']) {
		// prevent updating this too much
		return androidView.getContentDescription();
	}

	const contentDescriptionBuilder = new Array<string>();

	// Workaround: TalkBack won't read the checked state for fake Switch.
	if (view.accessibilityRole === AccessibilityRole.Switch) {
		const androidSwitch = new android.widget.Switch(getApplicationContext());
		if (view.accessibilityState === AccessibilityState.Checked) {
			contentDescriptionBuilder.push(androidSwitch.getTextOn());
		} else {
			contentDescriptionBuilder.push(androidSwitch.getTextOff());
		}
	}

	if (view.accessibilityLabel) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - have accessibilityLabel`, Trace.categories.Accessibility);
		}

		contentDescriptionBuilder.push(`${view.accessibilityLabel}`);
	}

	if (view.accessibilityValue) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - have accessibilityValue`, Trace.categories.Accessibility);
		}

		contentDescriptionBuilder.push(`${view.accessibilityValue}`);
	} else if (textValue) {
		if (textValue !== view.accessibilityLabel) {
			if (Trace.isEnabled()) {
				Trace.write(`${cls} - don't have accessibilityValue - use 'text' value`, Trace.categories.Accessibility);
			}

			contentDescriptionBuilder.push(`${textValue}`);
		}
	} else if (titleValue) {
		if (titleValue !== view.accessibilityLabel) {
			if (Trace.isEnabled()) {
				Trace.write(`${cls} - don't have accessibilityValue - use 'title' value`, Trace.categories.Accessibility);
			}

			contentDescriptionBuilder.push(`${titleValue}`);
		}
	}

	if (view.accessibilityHint) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - have accessibilityHint`, Trace.categories.Accessibility);
		}

		contentDescriptionBuilder.push(`${view.accessibilityHint}`);
	}

	const contentDescription = contentDescriptionBuilder.join('. ').trim().replace(/^\.$/, '');

	if (contentDescription) {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - set to "${contentDescription}"`, Trace.categories.Accessibility);
		}

		androidView.setContentDescription(contentDescription);
	} else {
		if (Trace.isEnabled()) {
			Trace.write(`${cls} - remove value`, Trace.categories.Accessibility);
		}

		androidView.setContentDescription(null);
	}

	view['_lastTitle'] = titleValue;
	view['_lastText'] = textValue;
	view._androidContentDescriptionUpdated = false;

	return contentDescription;
}

export function setupAccessibleView(view: any /* any */): void {
	updateA11yPropertiesCallback(view);
}

// stubs
