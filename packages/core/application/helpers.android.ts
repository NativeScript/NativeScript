import { SDK_VERSION } from '../utils/constants';
import { getNativeApp } from './helpers-common';

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

let applicationContext: android.content.Context;
export function getApplicationContext(): android.content.Context {
	if (!applicationContext) {
		applicationContext = getNativeApp<android.app.Application>().getApplicationContext();
	}
	return applicationContext;
}
