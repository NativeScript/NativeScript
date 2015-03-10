/// <reference path="../../../../../../../forks/angular2/typings/hammerjs/hammerjs.d.ts" />
import { HammerGesturesPluginCommon } from './hammer_common';
import { Element } from 'angular2/src/facade/dom';
export declare class HammerGesturesPlugin extends HammerGesturesPluginCommon {
    constructor();
    supports(eventName: string): boolean;
    addEventListener(element: Element, eventName: string, handler: Function): void;
}
