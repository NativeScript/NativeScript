import { Frame, EventData, Button, ActionBar } from '@nativescript/core';

const iconModes = ['automatic', 'alwaysOriginal', 'alwaysTemplate', undefined];

export function navigate(args) {
	Frame.topmost().navigate('action-bar/clean-page');
}

export function onChangeRenderingMode(args: EventData) {
	const button = <Button>args.object;
	const actionBar = <ActionBar>button.page.actionBar;
	actionBar.iosIconRenderingMode = <'automatic' | 'alwaysOriginal' | 'alwaysTemplate'>iconModes[(iconModes.indexOf(actionBar.iosIconRenderingMode) + 1) % iconModes.length];
	button.text = '' + actionBar.iosIconRenderingMode;
}
