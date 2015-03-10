import { ProtoElementInjector } from './element_injector';
import { DirectiveMetadata } from './directive_metadata';
import { ProtoView } from './view';
export declare class ElementBinder {
    protoElementInjector: ProtoElementInjector;
    componentDirective: DirectiveMetadata;
    viewportDirective: DirectiveMetadata;
    textNodeIndices: List<int>;
    hasElementPropertyBindings: boolean;
    nestedProtoView: ProtoView;
    events: Map<any, any>;
    constructor(protoElementInjector: ProtoElementInjector, componentDirective: DirectiveMetadata, viewportDirective: DirectiveMetadata);
}
