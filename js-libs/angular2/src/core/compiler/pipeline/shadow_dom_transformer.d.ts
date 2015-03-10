import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
import { DirectiveMetadata } from 'angular2/src/core/compiler/directive_metadata';
import { ShadowDomStrategy } from 'angular2/src/core/compiler/shadow_dom_strategy';
import { Element } from 'angular2/src/facade/dom';
export declare class ShadowDomTransformer extends CompileStep {
    _selector: string;
    _strategy: ShadowDomStrategy;
    _styleHost: Element;
    _lastInsertedStyle: Element;
    constructor(cmpMetadata: DirectiveMetadata, strategy: ShadowDomStrategy, styleHost: Element);
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
    clearCache(): void;
    _insertStyle(el: Element, css: string): void;
}
