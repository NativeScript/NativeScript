import { DependencyAnnotation } from 'angular2/di';
/**
 * The directive can inject an emitter function that would emit events onto the
 * directive host element.
 */
export declare class EventEmitter extends DependencyAnnotation {
    eventName: string;
    constructor(eventName: any);
}
