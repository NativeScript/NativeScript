import { ChangeDetection, Parser } from 'angular2/change_detection';
import { ViewSplitter } from './view_splitter';
import { DirectiveMetadata } from 'angular2/src/core/compiler/directive_metadata';
import { ShadowDomStrategy } from 'angular2/src/core/compiler/shadow_dom_strategy';
/**
 * Default steps used for compiling a template.
 * Takes in an HTMLElement and produces the ProtoViews,
 * ProtoElementInjectors and ElementBinders in the end.
 */
export declare function createDefaultSteps(changeDetection: ChangeDetection, parser: Parser, compiledComponent: DirectiveMetadata, directives: List<DirectiveMetadata>, shadowDomStrategy: ShadowDomStrategy): ViewSplitter[];
