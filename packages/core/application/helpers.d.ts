/**
 * Initialize accessibility for View. This should be called on loaded-event.
 */
export function setupAccessibleView(view: View): void;
/**
 * Android: Update the content description for views
 */
export const updateContentDescription: (view: any /* View */, forceUpdate?: boolean) => string | null;
export function applyContentDescription(view: any /* View */, forceUpdate?: boolean);
/* Android app-wide helpers */
export function androidGetCurrentActivity(): androidx.appcompat.app.AppCompatActivity;
export function androidGetForegroundActivity(): androidx.appcompat.app.AppCompatActivity;
export function androidSetForegroundActivity(activity: androidx.appcompat.app.AppCompatActivity): void;
export function androidGetStartActivity(): androidx.appcompat.app.AppCompatActivity;
export function androidSetStartActivity(activity: androidx.appcompat.app.AppCompatActivity): void;
