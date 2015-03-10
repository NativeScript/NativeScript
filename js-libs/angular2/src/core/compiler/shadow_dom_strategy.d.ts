import { Element } from 'angular2/src/facade/dom';
import { View } from './view';
import { LightDom } from './shadow_dom_emulation/light_dom';
export declare class ShadowDomStrategy {
    attachTemplate(el: Element, view: View): void;
    constructLightDom(lightDomView: View, shadowDomView: View, el: Element): void;
    polyfillDirectives(): List<Type>;
    shim(): boolean;
    extractStyles(): boolean;
}
export declare class EmulatedShadowDomStrategy extends ShadowDomStrategy {
    constructor();
    attachTemplate(el: Element, view: View): void;
    constructLightDom(lightDomView: View, shadowDomView: View, el: Element): LightDom;
    polyfillDirectives(): List<Type>;
    shim(): boolean;
    extractStyles(): boolean;
}
export declare class NativeShadowDomStrategy extends ShadowDomStrategy {
    constructor();
    attachTemplate(el: Element, view: View): void;
    constructLightDom(lightDomView: View, shadowDomView: View, el: Element): any;
    polyfillDirectives(): List<Type>;
    shim(): boolean;
    extractStyles(): boolean;
}
