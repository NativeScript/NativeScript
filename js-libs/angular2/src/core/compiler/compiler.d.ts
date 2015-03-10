import { Element } from 'angular2/src/facade/dom';
import { ChangeDetection, Parser } from 'angular2/change_detection';
import { DirectiveMetadataReader } from './directive_metadata_reader';
import { ProtoView } from './view';
import { CompileElement } from './pipeline/compile_element';
import { TemplateLoader } from './template_loader';
import { TemplateResolver } from './template_resolver';
import { DirectiveMetadata } from './directive_metadata';
import { Template } from '../annotations/template';
import { ShadowDomStrategy } from './shadow_dom_strategy';
import { CompileStep } from './pipeline/compile_step';
/**
 * Cache that stores the ProtoView of the template of a component.
 * Used to prevent duplicate work and resolve cyclic dependencies.
 */
export declare class CompilerCache {
    _cache: Map<Type, ProtoView>;
    constructor();
    set(component: Type, protoView: ProtoView): void;
    get(component: Type): ProtoView;
    clear(): void;
}
/**
 * The compiler loads and translates the html templates of components into
 * nested ProtoViews. To decompose its functionality it uses
 * the CompilePipeline and the CompileSteps.
 */
export declare class Compiler {
    _reader: DirectiveMetadataReader;
    _parser: Parser;
    _compilerCache: CompilerCache;
    _changeDetection: ChangeDetection;
    _templateLoader: TemplateLoader;
    _compiling: Map<Type, Promise<ProtoView>>;
    _shadowDomStrategy: ShadowDomStrategy;
    _shadowDomDirectives: List<DirectiveMetadata>;
    _templateResolver: TemplateResolver;
    constructor(changeDetection: ChangeDetection, templateLoader: TemplateLoader, reader: DirectiveMetadataReader, parser: Parser, cache: CompilerCache, shadowDomStrategy: ShadowDomStrategy, templateResolver: TemplateResolver);
    createSteps(component: Type, template: Template): List<CompileStep>;
    compile(component: Type): Promise<ProtoView>;
    _compile(component: Type): any;
    _compileTemplate(template: Template, tplElement: Element, component: Type): any;
    _compileNestedProtoView(ce: CompileElement, promises: List<Promise<any>>): void;
    _flattenDirectives(template: Template): List<Type>;
    _flattenList(tree: List<any>, out: List<Type>): void;
}
