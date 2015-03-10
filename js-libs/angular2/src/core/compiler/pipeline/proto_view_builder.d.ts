import { ChangeDetection } from 'angular2/change_detection';
import { CompileStep } from './compile_step';
import { CompileElement } from './compile_element';
import { CompileControl } from './compile_control';
import { ShadowDomStrategy } from '../shadow_dom_strategy';
/**
 * Creates ProtoViews and forwards variable bindings from parent to children.
 *
 * Fills:
 * - (in parent): CompileElement#inheritedElementBinder.nestedProtoView
 * - CompileElement#inheritedProtoView
 *
 * Reads:
 * - (in parent): CompileElement#inheritedProtoView
 * - (in parent): CompileElement#variableBindings
 * - CompileElement#isViewRoot
 */
export declare class ProtoViewBuilder extends CompileStep {
    changeDetection: ChangeDetection;
    _shadowDomStrategy: ShadowDomStrategy;
    constructor(changeDetection: ChangeDetection, shadowDomStrategy: ShadowDomStrategy);
    process(parent: CompileElement, current: CompileElement, control: CompileControl): void;
}
