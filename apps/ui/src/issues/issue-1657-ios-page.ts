import { EventData } from '@nativescript/core/data/observable';
var frameModule = require('@nativescript/core/ui/frame');
var platform = require('@nativescript/core/platform');
var defaultSpeed = -1;

export function navigatingTo(args: EventData) {
	if (__APPLE__) {
		if (defaultSpeed === -1) {
			defaultSpeed = frameModule.topmost().ios.controller.view.layer.speed;
			frameModule.topmost().ios.controller.navigationBar.translucent = false;
		}
	}
}

export function onTap() {
	frameModule.topmost().navigate({
		moduleName: 'issues/sub-1657-page',
	});
}

export function changeTranslucent() {
	if (__APPLE__) {
		frameModule.topmost().ios.controller.navigationBar.translucent = frameModule.topmost().ios.controller.navigationBar.translucent === true ? false : true;
	}
}

export function changeLayerSpeed() {
	frameModule.topmost().ios.controller.view.layer.speed = 0.01;
}

export function defaultLayerSpeed() {
	frameModule.topmost().ios.controller.view.layer.speed = defaultSpeed;
}
