import { Element } from 'angular2/src/facade/dom';
import { VmTurnZone } from 'angular2/src/core/zone/vm_turn_zone';
export declare class EventManager {
    _plugins: List<EventManagerPlugin>;
    _zone: VmTurnZone;
    constructor(plugins: List<EventManagerPlugin>, zone: VmTurnZone);
    addEventListener(element: Element, eventName: string, handler: Function): void;
    getZone(): VmTurnZone;
    _findPluginFor(eventName: string): EventManagerPlugin;
    _addNativeEventListener(element: Element, eventName: string, handler: Function): void;
}
export declare class EventManagerPlugin {
    manager: EventManager;
    supports(eventName: string): boolean;
    addEventListener(element: Element, eventName: string, handler: Function): void;
}
