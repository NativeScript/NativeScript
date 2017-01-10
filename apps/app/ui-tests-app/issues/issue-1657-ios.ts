import { EventData } from 'data/observable';
var frameModule = require("ui/frame");
var platform = require("platform");
var defaultSpeed = -1;

export function navigatingTo(args: EventData) {
  if (platform.device.os === platform.platformNames.ios) {
    if (defaultSpeed === -1) {
      defaultSpeed = frameModule.topmost().ios.controller.view.layer.speed;
      frameModule.topmost().ios.controller.navigationBar.translucent = false;
    }
  }
}

export function onTap() {
  frameModule.topmost().navigate({
    moduleName: "ui-tests-app/issues/sub-page-1657"
  });
}

export function changeTranslucent() {
  if (platform.device.os === platform.platformNames.ios) {
    frameModule.topmost().ios.controller.navigationBar.translucent = frameModule.topmost().ios.controller.navigationBar.translucent === true ? false : true;
  }
}

export function changeLayerSpeed() {
  frameModule.topmost().ios.controller.view.layer.speed = 0.01;
}

export function defaultLayerSpeed() {
  frameModule.topmost().ios.controller.view.layer.speed = defaultSpeed;
}