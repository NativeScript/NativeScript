import { Template } from 'angular2/src/core/annotations/template';
export declare class TemplateResolver {
    _cache: Map<any, any>;
    constructor();
    resolve(component: Type): Template;
    _resolve(component: Type): any;
}
