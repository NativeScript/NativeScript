declare var __registerDomainDispatcher;
export function DomainDispatcher(domain: string): ClassDecorator {
    return klass => __registerDomainDispatcher(domain, klass);
} 
 // ApplicationCache
export namespace ApplicationCacheDomain {

export interface ApplicationCacheResource {
    // Resource url.
    url: string;
    // Resource size.
    size: number;
    // Resource type.
    type: string;
}

export interface ApplicationCache {
    // Manifest URL.
    manifestURL: string;
    // Application cache size.
    size: number;
    // Application cache creation time.
    creationTime: number;
    // Application cache update time.
    updateTime: number;
    // Application cache resources.
    resources: ApplicationCacheResource[];
}

export interface FrameWithManifest {
    // Frame identifier.
    frameId: NetworkDomain.FrameId;
    // Manifest URL.
    manifestURL: string;
    // Application cache status.
    status: number;
}

export interface GetManifestForFrameMethodArguments { 
    // Identifier of the frame containing document whose manifest is retrieved. 
    frameId: NetworkDomain.FrameId
}
export interface GetApplicationCacheForFrameMethodArguments { 
    // Identifier of the frame containing document whose application cache is retrieved. 
    frameId: NetworkDomain.FrameId
}
export interface ApplicationCacheDomainDispatcher { 
    // Returns array of frame identifiers with manifest urls for each frame containing a document associated with some application cache.
    getFramesWithManifests(): { frameIds: FrameWithManifest[] };
    // Enables application cache domain notifications.
    enable(): void;
    // Returns manifest URL for document in the given frame.
    getManifestForFrame(params: GetManifestForFrameMethodArguments): { manifestURL: string };
    // Returns relevant application cache data for the document in given frame.
    getApplicationCacheForFrame(params: GetApplicationCacheForFrameMethodArguments): { applicationCache: ApplicationCache };
}
export class ApplicationCacheFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    applicationCacheStatusUpdated(frameId: NetworkDomain.FrameId, manifestURL: string, status: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "ApplicationCache.applicationCacheStatusUpdated", "params": { "frameId": frameId, "manifestURL": manifestURL, "status": status } } )); 
    }
    networkStateUpdated(isNowOnline: boolean): void { 
        this.dispatchMessage(JSON.stringify( { "method": "ApplicationCache.networkStateUpdated", "params": { "isNowOnline": isNowOnline } } )); 
    }
}
}

// CSS
// This domain exposes CSS read/write operations. All CSS objects, like stylesheets, rules, and styles, have an associated <code>id</code> used in subsequent operations on the related object. Each object type has a specific <code>id</code> structure, and those are not interchangeable between objects of different kinds. CSS objects can be loaded using the <code>get*ForNode()</code> calls (which accept a DOM node id). Alternatively, a client can discover all the existing stylesheets with the <code>getAllStyleSheets()</code> method and subsequently load the required stylesheet contents using the <code>getStyleSheet[Text]()</code> methods.
export namespace CSSDomain {
export type StyleSheetId = string

export interface CSSStyleId {
    // Enclosing stylesheet identifier.
    styleSheetId: StyleSheetId;
    // The style ordinal within the stylesheet.
    ordinal: number;
}

export interface CSSRuleId {
    // Enclosing stylesheet identifier.
    styleSheetId: StyleSheetId;
    // The rule ordinal within the stylesheet.
    ordinal: number;
}

export interface PseudoIdMatches {
    // Pseudo style identifier (see <code>enum PseudoId</code> in <code>RenderStyleConstants.h</code>).
    pseudoId: number;
    // Matches of CSS rules applicable to the pseudo style.
    matches: RuleMatch[];
}

export interface InheritedStyleEntry {
    // The ancestor node's inline style, if any, in the style inheritance chain.
    inlineStyle?: CSSStyle;
    // Matches of CSS rules matching the ancestor node in the style inheritance chain.
    matchedCSSRules: RuleMatch[];
}

export interface RuleMatch {
    // CSS rule in the match.
    rule: CSSRule;
    // Matching selector indices in the rule's selectorList selectors (0-based).
    matchingSelectors: number[];
}

export interface CSSSelector {
    // Canonicalized selector text.
    text: string;
    // Specificity (a, b, c) tuple. Included if the selector is sent in response to CSS.getMatchedStylesForNode which provides a context element.
    specificity?: number[];
    // Whether or not the specificity can be dynamic. Included if the selector is sent in response to CSS.getMatchedStylesForNode which provides a context element.
    dynamic?: boolean;
}

export interface SelectorList {
    // Selectors in the list.
    selectors: CSSSelector[];
    // Rule selector text.
    text: string;
    // Rule selector range in the underlying resource (if available).
    range?: SourceRange;
}

export interface CSSStyleAttribute {
    // DOM attribute name (e.g. "width").
    name: string;
    // CSS style generated by the respective DOM attribute.
    style: CSSStyle;
}

export interface CSSStyleSheetHeader {
    // The stylesheet identifier.
    styleSheetId: StyleSheetId;
    // Owner frame identifier.
    frameId: NetworkDomain.FrameId;
    // Stylesheet resource URL.
    sourceURL: string;
    // Stylesheet origin.
    origin: StyleSheetOrigin;
    // Stylesheet title.
    title: string;
    // Denotes whether the stylesheet is disabled.
    disabled: boolean;
}

export interface CSSStyleSheetBody {
    // The stylesheet identifier.
    styleSheetId: StyleSheetId;
    // Stylesheet resource URL.
    rules: CSSRule[];
    // Stylesheet resource contents (if available).
    text?: string;
}

export interface CSSRule {
    // The CSS rule identifier (absent for user agent stylesheet and user-specified stylesheet rules).
    ruleId?: CSSRuleId;
    // Rule selector data.
    selectorList: SelectorList;
    // Parent stylesheet resource URL (for regular rules).
    sourceURL?: string;
    // Line ordinal of the rule selector start character in the resource.
    sourceLine: number;
    // Parent stylesheet's origin.
    origin: StyleSheetOrigin;
    // Associated style declaration.
    style: CSSStyle;
    // Media list array (for rules involving media queries). The array enumerates media queries starting with the innermost one, going outwards.
    media?: CSSMedia[];
}

export interface SourceRange {
    // Start line of range.
    startLine: number;
    // Start column of range (inclusive).
    startColumn: number;
    // End line of range
    endLine: number;
    // End column of range (exclusive).
    endColumn: number;
}

export interface ShorthandEntry {
    // Shorthand name.
    name: string;
    // Shorthand value.
    value: string;
}

export interface CSSPropertyInfo {
    // Property name.
    name: string;
    // Longhand property names.
    longhands?: string[];
    // Supported values for this property.
    values?: string[];
}

export interface CSSComputedStyleProperty {
    // Computed style property name.
    name: string;
    // Computed style property value.
    value: string;
}

export interface CSSStyle {
    // The CSS style identifier (absent for attribute styles).
    styleId?: CSSStyleId;
    // CSS properties in the style.
    cssProperties: CSSProperty[];
    // Computed values for all shorthands found in the style.
    shorthandEntries: ShorthandEntry[];
    // Style declaration text (if available).
    cssText?: string;
    // Style declaration range in the enclosing stylesheet (if available).
    range?: SourceRange;
    // The effective "width" property value from this style.
    width?: string;
    // The effective "height" property value from this style.
    height?: string;
}

export interface CSSProperty {
    // The property name.
    name: string;
    // The property value.
    value: string;
    // The property priority (implies "" if absent).
    priority?: string;
    // Whether the property is implicit (implies <code>false</code> if absent).
    implicit?: boolean;
    // The full property text as specified in the style.
    text?: string;
    // Whether the property is understood by the browser (implies <code>true</code> if absent).
    parsedOk?: boolean;
    // Whether the property is active or disabled.
    status?: CSSPropertyStatus;
    // The entire property range in the enclosing style declaration (if available).
    range?: SourceRange;
}

export interface CSSMedia {
    // Media query text.
    text: string;
    // Source of the media query: "mediaRule" if specified by a @media rule, "importRule" if specified by an @import rule, "linkedSheet" if specified by a "media" attribute in a linked stylesheet's LINK tag, "inlineSheet" if specified by a "media" attribute in an inline stylesheet's STYLE tag.
    source: any /* mediaRule,importRule,linkedSheet,inlineSheet */;
    // URL of the document containing the media query description.
    sourceURL?: string;
    // Line in the document containing the media query (not defined for the "stylesheet" source).
    sourceLine?: number;
}

export interface Region {
    // The "overset" attribute of a Named Flow.
    regionOverset: any /* overset,fit,empty */;
    // The corresponding DOM node id.
    nodeId: DOMDomain.NodeId;
}

export interface NamedFlow {
    // The document node id.
    documentNodeId: DOMDomain.NodeId;
    // Named Flow identifier.
    name: string;
    // The "overset" attribute of a Named Flow.
    overset: boolean;
    // An array of nodes that flow into the Named Flow.
    content: DOMDomain.NodeId[];
    // An array of regions associated with the Named Flow.
    regions: Region[];
}

export const enum StyleSheetOrigin { User, UserAgent, Inspector, Regular }; 

export const enum CSSPropertyStatus { Active, Inactive, Disabled, Style }; 

export interface GetMatchedStylesForNodeMethodArguments { 
    nodeId: DOMDomain.NodeId,
    // Whether to include pseudo styles (default: true). 
    includePseudo?: boolean,
    // Whether to include inherited styles (default: true). 
    includeInherited?: boolean
}
export interface GetInlineStylesForNodeMethodArguments { 
    nodeId: DOMDomain.NodeId
}
export interface GetComputedStyleForNodeMethodArguments { 
    nodeId: DOMDomain.NodeId
}
export interface GetStyleSheetMethodArguments { 
    styleSheetId: StyleSheetId
}
export interface GetStyleSheetTextMethodArguments { 
    styleSheetId: StyleSheetId
}
export interface SetStyleSheetTextMethodArguments { 
    styleSheetId: StyleSheetId,
    text: string
}
export interface SetStyleTextMethodArguments { 
    styleId: CSSStyleId,
    text: string
}
export interface SetRuleSelectorMethodArguments { 
    ruleId: CSSRuleId,
    selector: string
}
export interface AddRuleMethodArguments { 
    contextNodeId: DOMDomain.NodeId,
    selector: string
}
export interface ForcePseudoStateMethodArguments { 
    // The element id for which to force the pseudo state. 
    nodeId: DOMDomain.NodeId,
    // Element pseudo classes to force when computing the element's style. 
    forcedPseudoClasses: any /* active,focus,hover,visited */[]
}
export interface GetNamedFlowCollectionMethodArguments { 
    // The document node id for which to get the Named Flow Collection. 
    documentNodeId: DOMDomain.NodeId
}
export interface CSSDomainDispatcher { 
    // Enables the CSS agent for the given page. Clients should not assume that the CSS agent has been enabled until the result of this command is received.
    enable(): void;
    // Disables the CSS agent for the given page.
    disable(): void;
    // Returns requested styles for a DOM node identified by <code>nodeId</code>.
    getMatchedStylesForNode(params: GetMatchedStylesForNodeMethodArguments): { matchedCSSRules?: RuleMatch[], pseudoElements?: PseudoIdMatches[], inherited?: InheritedStyleEntry[] };
    // Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM attributes) for a DOM node identified by <code>nodeId</code>.
    getInlineStylesForNode(params: GetInlineStylesForNodeMethodArguments): { inlineStyle?: CSSStyle, attributesStyle?: CSSStyle };
    // Returns the computed style for a DOM node identified by <code>nodeId</code>.
    getComputedStyleForNode(params: GetComputedStyleForNodeMethodArguments): { computedStyle: CSSComputedStyleProperty[] };
    // Returns metainfo entries for all known stylesheets.
    getAllStyleSheets(): { headers: CSSStyleSheetHeader[] };
    // Returns stylesheet data for the specified <code>styleSheetId</code>.
    getStyleSheet(params: GetStyleSheetMethodArguments): { styleSheet: CSSStyleSheetBody };
    // Returns the current textual content and the URL for a stylesheet.
    getStyleSheetText(params: GetStyleSheetTextMethodArguments): { text: string };
    // Sets the new stylesheet text, thereby invalidating all existing <code>CSSStyleId</code>'s and <code>CSSRuleId</code>'s contained by this stylesheet.
    setStyleSheetText(params: SetStyleSheetTextMethodArguments): void;
    // Sets the new <code>text</code> for the respective style.
    setStyleText(params: SetStyleTextMethodArguments): { style: CSSStyle };
    // Modifies the rule selector.
    setRuleSelector(params: SetRuleSelectorMethodArguments): { rule: CSSRule };
    // Creates a new empty rule with the given <code>selector</code> in a special "inspector" stylesheet in the owner document of the context node.
    addRule(params: AddRuleMethodArguments): { rule: CSSRule };
    // Returns all supported CSS property names.
    getSupportedCSSProperties(): { cssProperties: CSSPropertyInfo[] };
    // Ensures that the given node will have specified pseudo-classes whenever its style is computed by the browser.
    forcePseudoState(params: ForcePseudoStateMethodArguments): void;
    // Returns the Named Flows from the document.
    getNamedFlowCollection(params: GetNamedFlowCollectionMethodArguments): { namedFlows: NamedFlow[] };
}
export class CSSFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Fires whenever a MediaQuery result changes (for example, after a browser window has been resized.) The current implementation considers only viewport-dependent media features.
    mediaQueryResultChanged(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "CSS.mediaQueryResultChanged", "params": {  } } )); 
    }
    // Fired whenever a stylesheet is changed as a result of the client operation.
    styleSheetChanged(styleSheetId: StyleSheetId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "CSS.styleSheetChanged", "params": { "styleSheetId": styleSheetId } } )); 
    }
    // Fires when a Named Flow is created.
    namedFlowCreated(namedFlow: NamedFlow): void { 
        this.dispatchMessage(JSON.stringify( { "method": "CSS.namedFlowCreated", "params": { "namedFlow": namedFlow } } )); 
    }
    // Fires when a Named Flow is removed: has no associated content nodes and regions.
    namedFlowRemoved(documentNodeId: DOMDomain.NodeId, flowName: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "CSS.namedFlowRemoved", "params": { "documentNodeId": documentNodeId, "flowName": flowName } } )); 
    }
    // Fires if any of the regionOverset values changed in a Named Flow's region chain.
    regionOversetChanged(namedFlow: NamedFlow): void { 
        this.dispatchMessage(JSON.stringify( { "method": "CSS.regionOversetChanged", "params": { "namedFlow": namedFlow } } )); 
    }
    // Fires when a Named Flow's has been registered with a new content node.
    registeredNamedFlowContentElement(documentNodeId: DOMDomain.NodeId, flowName: string, contentNodeId: DOMDomain.NodeId, nextContentNodeId: DOMDomain.NodeId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "CSS.registeredNamedFlowContentElement", "params": { "documentNodeId": documentNodeId, "flowName": flowName, "contentNodeId": contentNodeId, "nextContentNodeId": nextContentNodeId } } )); 
    }
    // Fires when a Named Flow's has been registered with a new content node.
    unregisteredNamedFlowContentElement(documentNodeId: DOMDomain.NodeId, flowName: string, contentNodeId: DOMDomain.NodeId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "CSS.unregisteredNamedFlowContentElement", "params": { "documentNodeId": documentNodeId, "flowName": flowName, "contentNodeId": contentNodeId } } )); 
    }
}
}

// Console
// Console domain defines methods and events for interaction with the JavaScript console. Console collects messages created by means of the <a href='http://getfirebug.com/wiki/index.php/Console_API'>JavaScript Console API</a>. One needs to enable this domain using <code>enable</code> command in order to start receiving the console messages. Browser collects messages issued while console domain is not enabled as well and reports them using <code>messageAdded</code> notification upon enabling.
export namespace ConsoleDomain {

export interface ConsoleMessage {
    // Message source.
    source: any /* xml,javascript,network,console-api,storage,appcache,rendering,css,security,content-blocker,other */;
    // Message severity.
    level: any /* log,info,warning,error,debug */;
    // Message text.
    text: string;
    // Console message type.
    type?: any /* log,dir,dirxml,table,trace,clear,startGroup,startGroupCollapsed,endGroup,assert,timing,profile,profileEnd */;
    // URL of the message origin.
    url?: string;
    // Line number in the resource that generated this message.
    line?: number;
    // Column number on the line in the resource that generated this message.
    column?: number;
    // Repeat count for repeated messages.
    repeatCount?: number;
    // Message parameters in case of the formatted message.
    parameters?: RuntimeDomain.RemoteObject[];
    // JavaScript stack trace for assertions and error messages.
    stackTrace?: CallFrame[];
    // Identifier of the network request associated with this message.
    networkRequestId?: NetworkDomain.RequestId;
}

export interface CallFrame {
    // JavaScript function name.
    functionName: string;
    // JavaScript script name or url.
    url: string;
    // JavaScript script line number.
    lineNumber: number;
    // JavaScript script column number.
    columnNumber: number;
}

export interface SetMonitoringXHREnabledMethodArguments { 
    // Monitoring enabled state. 
    enabled: boolean
}
export interface AddInspectedNodeMethodArguments { 
    // DOM node id to be accessible by means of $x command line API. 
    nodeId: DOMDomain.NodeId
}
export interface ConsoleDomainDispatcher { 
    // Enables console domain, sends the messages collected so far to the client by means of the <code>messageAdded</code> notification.
    enable(): void;
    // Disables console domain, prevents further console messages from being reported to the client.
    disable(): void;
    // Clears console messages collected in the browser.
    clearMessages(): void;
    // Toggles monitoring of XMLHttpRequest. If <code>true</code>, console will receive messages upon each XHR issued.
    setMonitoringXHREnabled(params: SetMonitoringXHREnabledMethodArguments): void;
    // Enables console to refer to the node with given id via $x (see Command Line API for more details $x functions).
    addInspectedNode(params: AddInspectedNodeMethodArguments): void;
}
export class ConsoleFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Issued when new console message is added.
    messageAdded(message: ConsoleMessage): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Console.messageAdded", "params": { "message": message } } )); 
    }
    // Issued when subsequent message(s) are equal to the previous one(s).
    messageRepeatCountUpdated(count: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Console.messageRepeatCountUpdated", "params": { "count": count } } )); 
    }
    // Issued when console is cleared. This happens either upon <code>clearMessages</code> command or after page navigation.
    messagesCleared(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Console.messagesCleared", "params": {  } } )); 
    }
}
}

// DOM
// This domain exposes DOM read/write operations. Each DOM Node is represented with its mirror object that has an <code>id</code>. This <code>id</code> can be used to get additional information on the Node, resolve it into the JavaScript object wrapper, etc. It is important that client receives DOM events only for the nodes that are known to the client. Backend keeps track of the nodes that were sent to the client and never sends the same node twice. It is client's responsibility to collect information about the nodes that were sent to the client.<p>Note that <code>iframe</code> owner elements will return corresponding document elements as their child nodes.</p>
export namespace DOMDomain {
// Unique DOM node identifier.
export type NodeId = number
// Unique DOM node identifier used to reference a node that may not have been pushed to the front-end.
export type BackendNodeId = number

export interface Node {
    // Node identifier that is passed into the rest of the DOM messages as the <code>nodeId</code>. Backend will only push node with given <code>id</code> once. It is aware of all requested nodes and will only fire DOM events for nodes known to the client.
    nodeId: NodeId;
    // <code>Node</code>'s nodeType.
    nodeType: number;
    // <code>Node</code>'s nodeName.
    nodeName: string;
    // <code>Node</code>'s localName.
    localName: string;
    // <code>Node</code>'s nodeValue.
    nodeValue: string;
    // Child count for <code>Container</code> nodes.
    childNodeCount?: number;
    // Child nodes of this node when requested with children.
    children?: Node[];
    // Attributes of the <code>Element</code> node in the form of flat array <code>[name1, value1, name2, value2]</code>.
    attributes?: string[];
    // Document URL that <code>Document</code> or <code>FrameOwner</code> node points to.
    documentURL?: string;
    // Base URL that <code>Document</code> or <code>FrameOwner</code> node uses for URL completion.
    baseURL?: string;
    // <code>DocumentType</code>'s publicId.
    publicId?: string;
    // <code>DocumentType</code>'s systemId.
    systemId?: string;
    // <code>DocumentType</code>'s internalSubset.
    internalSubset?: string;
    // <code>Document</code>'s XML version in case of XML documents.
    xmlVersion?: string;
    // <code>Attr</code>'s name.
    name?: string;
    // <code>Attr</code>'s value.
    value?: string;
    // Frame ID for frame owner elements.
    frameId?: NetworkDomain.FrameId;
    // Content document for frame owner elements.
    contentDocument?: Node;
    // Shadow root list for given element host.
    shadowRoots?: Node[];
    // Content document fragment for template elements
    templateContent?: Node;
    // Computed value for first recognized role token, default role per element, or overridden role.
    role?: string;
}

export interface EventListener {
    // <code>EventListener</code>'s type.
    type: string;
    // <code>EventListener</code>'s useCapture.
    useCapture: boolean;
    // <code>EventListener</code>'s isAttribute.
    isAttribute: boolean;
    // Target <code>DOMNode</code> id.
    nodeId: NodeId;
    // Event handler function body.
    handlerBody: string;
    // Handler code location.
    location?: DebuggerDomain.Location;
    // Source script URL.
    sourceName?: string;
    // Event handler function value.
    handler?: RuntimeDomain.RemoteObject;
}

export interface AccessibilityProperties {
    // <code>DOMNode</code> id of the accessibility object referenced by aria-activedescendant.
    activeDescendantNodeId?: NodeId;
    // Value of @aria-busy on current or ancestor node.
    busy?: boolean;
    // Checked state of certain form controls.
    checked?: any /* true,false,mixed */;
    // Array of <code>DOMNode</code> ids of the accessibility tree children if available.
    childNodeIds?: NodeId[];
    // Array of <code>DOMNode</code> ids of any nodes referenced via @aria-controls.
    controlledNodeIds?: NodeId[];
    // Disabled state of form controls.
    disabled?: boolean;
    // Indicates whether there is an existing AX object for the DOM node. If this is false, all the other properties will be default values.
    exists: boolean;
    // Expanded state.
    expanded?: boolean;
    // Array of <code>DOMNode</code> ids of any nodes referenced via @aria-flowto.
    flowedNodeIds?: NodeId[];
    // Focused state. Only defined on focusable elements.
    focused?: boolean;
    // Indicates whether the accessibility of the associated AX object node is ignored, whether heuristically or explicitly.
    ignored?: boolean;
    // State indicating whether the accessibility of the associated AX object node is ignored by default for node type.
    ignoredByDefault?: boolean;
    // Invalid status of form controls.
    invalid?: any /* true,false,grammar,spelling */;
    // Hidden state. True if node or an ancestor is hidden via CSS or explicit @aria-hidden, to clarify why the element is ignored.
    hidden?: boolean;
    // Computed label value for the node, sometimes calculated by referencing other nodes.
    label: string;
    // Value of @aria-atomic.
    liveRegionAtomic?: boolean;
    // Token value(s) of element's @aria-relevant attribute. Array of string values matching $ref LiveRegionRelevant. FIXME: Enum values blocked by http://webkit.org/b/133711
    liveRegionRelevant?: string[];
    // Value of element's @aria-live attribute.
    liveRegionStatus?: any /* assertive,polite,off */;
    // <code>DOMNode</code> id of node or closest ancestor node that has a mousedown, mouseup, or click event handler.
    mouseEventNodeId?: NodeId;
    // Target <code>DOMNode</code> id.
    nodeId: NodeId;
    // Array of <code>DOMNode</code> ids of any nodes referenced via @aria-owns.
    ownedNodeIds?: NodeId[];
    // <code>DOMNode</code> id of the accessibility tree parent object if available.
    parentNodeId?: NodeId;
    // Pressed state for toggle buttons.
    pressed?: boolean;
    // Readonly state of text controls.
    readonly?: boolean;
    // Required state of form controls.
    required?: boolean;
    // Computed value for first recognized role token, default role per element, or overridden role.
    role: string;
    // Selected state of certain form controls.
    selected?: boolean;
    // Array of <code>DOMNode</code> ids of any children marked as selected.
    selectedChildNodeIds?: NodeId[];
}

export interface RGBAColor {
    // The red component, in the [0-255] range.
    r: number;
    // The green component, in the [0-255] range.
    g: number;
    // The blue component, in the [0-255] range.
    b: number;
    // The alpha component, in the [0-1] range (default: 1).
    a?: number;
}

export interface HighlightConfig {
    // Whether the node info tooltip should be shown (default: false).
    showInfo?: boolean;
    // The content box highlight fill color (default: transparent).
    contentColor?: RGBAColor;
    // The padding highlight fill color (default: transparent).
    paddingColor?: RGBAColor;
    // The border highlight fill color (default: transparent).
    borderColor?: RGBAColor;
    // The margin highlight fill color (default: transparent).
    marginColor?: RGBAColor;
}

export const enum LiveRegionRelevant { Additions, Removals, Text }; 

export interface RequestChildNodesMethodArguments { 
    // Id of the node to get children for. 
    nodeId: NodeId,
    // The maximum depth at which children should be retrieved, defaults to 1. Use -1 for the entire subtree or provide an integer larger than 0. 
    depth?: number
}
export interface QuerySelectorMethodArguments { 
    // Id of the node to query upon. 
    nodeId: NodeId,
    // Selector string. 
    selector: string
}
export interface QuerySelectorAllMethodArguments { 
    // Id of the node to query upon. 
    nodeId: NodeId,
    // Selector string. 
    selector: string
}
export interface SetNodeNameMethodArguments { 
    // Id of the node to set name for. 
    nodeId: NodeId,
    // New node's name. 
    name: string
}
export interface SetNodeValueMethodArguments { 
    // Id of the node to set value for. 
    nodeId: NodeId,
    // New node's value. 
    value: string
}
export interface RemoveNodeMethodArguments { 
    // Id of the node to remove. 
    nodeId: NodeId
}
export interface SetAttributeValueMethodArguments { 
    // Id of the element to set attribute for. 
    nodeId: NodeId,
    // Attribute name. 
    name: string,
    // Attribute value. 
    value: string
}
export interface SetAttributesAsTextMethodArguments { 
    // Id of the element to set attributes for. 
    nodeId: NodeId,
    // Text with a number of attributes. Will parse this text using HTML parser. 
    text: string,
    // Attribute name to replace with new attributes derived from text in case text parsed successfully. 
    name?: string
}
export interface RemoveAttributeMethodArguments { 
    // Id of the element to remove attribute from. 
    nodeId: NodeId,
    // Name of the attribute to remove. 
    name: string
}
export interface GetEventListenersForNodeMethodArguments { 
    // Id of the node to get listeners for. 
    nodeId: NodeId,
    // Symbolic group name for handler value. Handler value is not returned without this parameter specified. 
    objectGroup?: string
}
export interface GetAccessibilityPropertiesForNodeMethodArguments { 
    // Id of the node for which to get accessibility properties. 
    nodeId: NodeId
}
export interface GetOuterHTMLMethodArguments { 
    // Id of the node to get markup for. 
    nodeId: NodeId
}
export interface SetOuterHTMLMethodArguments { 
    // Id of the node to set markup for. 
    nodeId: NodeId,
    // Outer HTML markup to set. 
    outerHTML: string
}
export interface PerformSearchMethodArguments { 
    // Plain text or query selector or XPath search query. 
    query: string,
    // Ids of nodes to use as starting points for the search. 
    nodeIds?: NodeId[]
}
export interface GetSearchResultsMethodArguments { 
    // Unique search session identifier. 
    searchId: string,
    // Start index of the search result to be returned. 
    fromIndex: number,
    // End index of the search result to be returned. 
    toIndex: number
}
export interface DiscardSearchResultsMethodArguments { 
    // Unique search session identifier. 
    searchId: string
}
export interface RequestNodeMethodArguments { 
    // JavaScript object id to convert into node. 
    objectId: RuntimeDomain.RemoteObjectId
}
export interface SetInspectModeEnabledMethodArguments { 
    // True to enable inspection mode, false to disable it. 
    enabled: boolean,
    // A descriptor for the highlight appearance of hovered-over nodes. May be omitted if <code>enabled == false</code>. 
    highlightConfig?: HighlightConfig
}
export interface HighlightRectMethodArguments { 
    // X coordinate 
    x: number,
    // Y coordinate 
    y: number,
    // Rectangle width 
    width: number,
    // Rectangle height 
    height: number,
    // The highlight fill color (default: transparent). 
    color?: RGBAColor,
    // The highlight outline color (default: transparent). 
    outlineColor?: RGBAColor,
    // Indicates whether the provided parameters are in page coordinates or in viewport coordinates (the default). 
    usePageCoordinates?: boolean
}
export interface HighlightQuadMethodArguments { 
    // Quad to highlight 
    quad: number[],
    // The highlight fill color (default: transparent). 
    color?: RGBAColor,
    // The highlight outline color (default: transparent). 
    outlineColor?: RGBAColor,
    // Indicates whether the provided parameters are in page coordinates or in viewport coordinates (the default). 
    usePageCoordinates?: boolean
}
export interface HighlightSelectorMethodArguments { 
    // A descriptor for the highlight appearance. 
    highlightConfig: HighlightConfig,
    // A CSS selector for finding matching nodes to highlight. 
    selectorString: string,
    // Identifier of the frame which will be searched using the selector.  If not provided, the main frame will be used. 
    frameId?: string
}
export interface HighlightNodeMethodArguments { 
    // A descriptor for the highlight appearance. 
    highlightConfig: HighlightConfig,
    // Identifier of the node to highlight. 
    nodeId?: NodeId,
    // JavaScript object id of the node to be highlighted. 
    objectId?: RuntimeDomain.RemoteObjectId
}
export interface HighlightFrameMethodArguments { 
    // Identifier of the frame to highlight. 
    frameId: NetworkDomain.FrameId,
    // The content box highlight fill color (default: transparent). 
    contentColor?: RGBAColor,
    // The content box highlight outline color (default: transparent). 
    contentOutlineColor?: RGBAColor
}
export interface PushNodeByPathToFrontendMethodArguments { 
    // Path to node in the proprietary format. 
    path: string
}
export interface PushNodeByBackendIdToFrontendMethodArguments { 
    // The backend node id of the node. 
    backendNodeId: BackendNodeId
}
export interface ReleaseBackendNodeIdsMethodArguments { 
    // The backend node ids group name. 
    nodeGroup: string
}
export interface ResolveNodeMethodArguments { 
    // Id of the node to resolve. 
    nodeId: NodeId,
    // Symbolic group name that can be used to release multiple objects. 
    objectGroup?: string
}
export interface GetAttributesMethodArguments { 
    // Id of the node to retrieve attibutes for. 
    nodeId: NodeId
}
export interface MoveToMethodArguments { 
    // Id of the node to drop. 
    nodeId: NodeId,
    // Id of the element to drop into. 
    targetNodeId: NodeId,
    // Drop node before given one. 
    insertBeforeNodeId?: NodeId
}
export interface FocusMethodArguments { 
    // Id of the node to focus. 
    nodeId: NodeId
}
export interface DOMDomainDispatcher { 
    // Returns the root DOM node to the caller.
    getDocument(): { root: Node };
    // Requests that children of the node with given id are returned to the caller in form of <code>setChildNodes</code> events where not only immediate children are retrieved, but all children down to the specified depth.
    requestChildNodes(params: RequestChildNodesMethodArguments): void;
    // Executes <code>querySelector</code> on a given node.
    querySelector(params: QuerySelectorMethodArguments): { nodeId: NodeId };
    // Executes <code>querySelectorAll</code> on a given node.
    querySelectorAll(params: QuerySelectorAllMethodArguments): { nodeIds: NodeId[] };
    // Sets node name for a node with given id.
    setNodeName(params: SetNodeNameMethodArguments): { nodeId: NodeId };
    // Sets node value for a node with given id.
    setNodeValue(params: SetNodeValueMethodArguments): void;
    // Removes node with given id.
    removeNode(params: RemoveNodeMethodArguments): void;
    // Sets attribute for an element with given id.
    setAttributeValue(params: SetAttributeValueMethodArguments): void;
    // Sets attributes on element with given id. This method is useful when user edits some existing attribute value and types in several attribute name/value pairs.
    setAttributesAsText(params: SetAttributesAsTextMethodArguments): void;
    // Removes attribute with given name from an element with given id.
    removeAttribute(params: RemoveAttributeMethodArguments): void;
    // Returns event listeners relevant to the node.
    getEventListenersForNode(params: GetEventListenersForNodeMethodArguments): { listeners: EventListener[] };
    // Returns a dictionary of accessibility properties for the node.
    getAccessibilityPropertiesForNode(params: GetAccessibilityPropertiesForNodeMethodArguments): { properties: AccessibilityProperties };
    // Returns node's HTML markup.
    getOuterHTML(params: GetOuterHTMLMethodArguments): { outerHTML: string };
    // Sets node HTML markup, returns new node id.
    setOuterHTML(params: SetOuterHTMLMethodArguments): void;
    // Searches for a given string in the DOM tree. Use <code>getSearchResults</code> to access search results or <code>cancelSearch</code> to end this search session.
    performSearch(params: PerformSearchMethodArguments): { searchId: string, resultCount: number };
    // Returns search results from given <code>fromIndex</code> to given <code>toIndex</code> from the sarch with the given identifier.
    getSearchResults(params: GetSearchResultsMethodArguments): { nodeIds: NodeId[] };
    // Discards search results from the session with the given id. <code>getSearchResults</code> should no longer be called for that search.
    discardSearchResults(params: DiscardSearchResultsMethodArguments): void;
    // Requests that the node is sent to the caller given the JavaScript node object reference. All nodes that form the path from the node to the root are also sent to the client as a series of <code>setChildNodes</code> notifications.
    requestNode(params: RequestNodeMethodArguments): { nodeId: NodeId };
    // Enters the 'inspect' mode. In this mode, elements that user is hovering over are highlighted. Backend then generates 'inspect' command upon element selection.
    setInspectModeEnabled(params: SetInspectModeEnabledMethodArguments): void;
    // Highlights given rectangle. Coordinates are absolute with respect to the main frame viewport.
    highlightRect(params: HighlightRectMethodArguments): void;
    // Highlights given quad. Coordinates are absolute with respect to the main frame viewport.
    highlightQuad(params: HighlightQuadMethodArguments): void;
    // Highlights all DOM nodes that match a given selector. A string containing a CSS selector must be specified.
    highlightSelector(params: HighlightSelectorMethodArguments): void;
    // Highlights DOM node with given id or with the given JavaScript object wrapper. Either nodeId or objectId must be specified.
    highlightNode(params: HighlightNodeMethodArguments): void;
    // Hides DOM node highlight.
    hideHighlight(): void;
    // Highlights owner element of the frame with given id.
    highlightFrame(params: HighlightFrameMethodArguments): void;
    // Requests that the node is sent to the caller given its path. // FIXME, use XPath
    pushNodeByPathToFrontend(params: PushNodeByPathToFrontendMethodArguments): { nodeId: NodeId };
    // Requests that the node is sent to the caller given its backend node id.
    pushNodeByBackendIdToFrontend(params: PushNodeByBackendIdToFrontendMethodArguments): { nodeId: NodeId };
    // Requests that group of <code>BackendNodeIds</code> is released.
    releaseBackendNodeIds(params: ReleaseBackendNodeIdsMethodArguments): void;
    // Resolves JavaScript node object for given node id.
    resolveNode(params: ResolveNodeMethodArguments): { object: RuntimeDomain.RemoteObject };
    // Returns attributes for the specified node.
    getAttributes(params: GetAttributesMethodArguments): { attributes: string[] };
    // Moves node into the new container, places it before the given anchor.
    moveTo(params: MoveToMethodArguments): { nodeId: NodeId };
    // Undoes the last performed action.
    undo(): void;
    // Re-does the last undone action.
    redo(): void;
    // Marks last undoable state.
    markUndoableState(): void;
    // Focuses the given element.
    focus(params: FocusMethodArguments): void;
}
export class DOMFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Fired when <code>Document</code> has been totally updated. Node ids are no longer valid.
    documentUpdated(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.documentUpdated", "params": {  } } )); 
    }
    // Fired when backend wants to provide client with the missing DOM structure. This happens upon most of the calls requesting node ids.
    setChildNodes(parentId: NodeId, nodes: Node[]): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.setChildNodes", "params": { "parentId": parentId, "nodes": nodes } } )); 
    }
    // Fired when <code>Element</code>'s attribute is modified.
    attributeModified(nodeId: NodeId, name: string, value: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.attributeModified", "params": { "nodeId": nodeId, "name": name, "value": value } } )); 
    }
    // Fired when <code>Element</code>'s attribute is removed.
    attributeRemoved(nodeId: NodeId, name: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.attributeRemoved", "params": { "nodeId": nodeId, "name": name } } )); 
    }
    // Fired when <code>Element</code>'s inline style is modified via a CSS property modification.
    inlineStyleInvalidated(nodeIds: NodeId[]): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.inlineStyleInvalidated", "params": { "nodeIds": nodeIds } } )); 
    }
    // Mirrors <code>DOMCharacterDataModified</code> event.
    characterDataModified(nodeId: NodeId, characterData: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.characterDataModified", "params": { "nodeId": nodeId, "characterData": characterData } } )); 
    }
    // Fired when <code>Container</code>'s child node count has changed.
    childNodeCountUpdated(nodeId: NodeId, childNodeCount: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.childNodeCountUpdated", "params": { "nodeId": nodeId, "childNodeCount": childNodeCount } } )); 
    }
    // Mirrors <code>DOMNodeInserted</code> event.
    childNodeInserted(parentNodeId: NodeId, previousNodeId: NodeId, node: Node): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.childNodeInserted", "params": { "parentNodeId": parentNodeId, "previousNodeId": previousNodeId, "node": node } } )); 
    }
    // Mirrors <code>DOMNodeRemoved</code> event.
    childNodeRemoved(parentNodeId: NodeId, nodeId: NodeId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.childNodeRemoved", "params": { "parentNodeId": parentNodeId, "nodeId": nodeId } } )); 
    }
    // Called when shadow root is pushed into the element.
    shadowRootPushed(hostId: NodeId, root: Node): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.shadowRootPushed", "params": { "hostId": hostId, "root": root } } )); 
    }
    // Called when shadow root is popped from the element.
    shadowRootPopped(hostId: NodeId, rootId: NodeId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOM.shadowRootPopped", "params": { "hostId": hostId, "rootId": rootId } } )); 
    }
}
}

// DOMDebugger
// DOM debugging allows setting breakpoints on particular DOM operations and events. JavaScript execution will stop on these operations as if there was a regular breakpoint set.
export namespace DOMDebuggerDomain {

export const enum DOMBreakpointType { SubtreeModified, AttributeModified, NodeRemoved }; 

export interface SetDOMBreakpointMethodArguments { 
    // Identifier of the node to set breakpoint on. 
    nodeId: DOMDomain.NodeId,
    // Type of the operation to stop upon. 
    type: DOMBreakpointType
}
export interface RemoveDOMBreakpointMethodArguments { 
    // Identifier of the node to remove breakpoint from. 
    nodeId: DOMDomain.NodeId,
    // Type of the breakpoint to remove. 
    type: DOMBreakpointType
}
export interface SetEventListenerBreakpointMethodArguments { 
    // DOM Event name to stop on (any DOM event will do). 
    eventName: string
}
export interface RemoveEventListenerBreakpointMethodArguments { 
    // Event name. 
    eventName: string
}
export interface SetInstrumentationBreakpointMethodArguments { 
    // Instrumentation name to stop on. 
    eventName: string
}
export interface RemoveInstrumentationBreakpointMethodArguments { 
    // Instrumentation name to stop on. 
    eventName: string
}
export interface SetXHRBreakpointMethodArguments { 
    // Resource URL substring. All XHRs having this substring in the URL will get stopped upon. 
    url: string
}
export interface RemoveXHRBreakpointMethodArguments { 
    // Resource URL substring. 
    url: string
}
export interface DOMDebuggerDomainDispatcher { 
    // Sets breakpoint on particular operation with DOM.
    setDOMBreakpoint(params: SetDOMBreakpointMethodArguments): void;
    // Removes DOM breakpoint that was set using <code>setDOMBreakpoint</code>.
    removeDOMBreakpoint(params: RemoveDOMBreakpointMethodArguments): void;
    // Sets breakpoint on particular DOM event.
    setEventListenerBreakpoint(params: SetEventListenerBreakpointMethodArguments): void;
    // Removes breakpoint on particular DOM event.
    removeEventListenerBreakpoint(params: RemoveEventListenerBreakpointMethodArguments): void;
    // Sets breakpoint on particular native event.
    setInstrumentationBreakpoint(params: SetInstrumentationBreakpointMethodArguments): void;
    // Sets breakpoint on particular native event.
    removeInstrumentationBreakpoint(params: RemoveInstrumentationBreakpointMethodArguments): void;
    // Sets breakpoint on XMLHttpRequest.
    setXHRBreakpoint(params: SetXHRBreakpointMethodArguments): void;
    // Removes breakpoint from XMLHttpRequest.
    removeXHRBreakpoint(params: RemoveXHRBreakpointMethodArguments): void;
}
}

// DOMStorage
// Query and modify DOM storage.
export namespace DOMStorageDomain {

export interface StorageId {
    // Security origin for the storage.
    securityOrigin: string;
    // Whether the storage is local storage (not session storage).
    isLocalStorage: boolean;
}

export interface GetDOMStorageItemsMethodArguments { 
    storageId: StorageId
}
export interface SetDOMStorageItemMethodArguments { 
    storageId: StorageId,
    key: string,
    value: string
}
export interface RemoveDOMStorageItemMethodArguments { 
    storageId: StorageId,
    key: string
}
export interface DOMStorageDomainDispatcher { 
    // Enables storage tracking, storage events will now be delivered to the client.
    enable(): void;
    // Disables storage tracking, prevents storage events from being sent to the client.
    disable(): void;
    getDOMStorageItems(params: GetDOMStorageItemsMethodArguments): { entries: string[][] };
    setDOMStorageItem(params: SetDOMStorageItemMethodArguments): void;
    removeDOMStorageItem(params: RemoveDOMStorageItemMethodArguments): void;
}
export class DOMStorageFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    domStorageItemsCleared(storageId: StorageId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOMStorage.domStorageItemsCleared", "params": { "storageId": storageId } } )); 
    }
    domStorageItemRemoved(storageId: StorageId, key: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOMStorage.domStorageItemRemoved", "params": { "storageId": storageId, "key": key } } )); 
    }
    domStorageItemAdded(storageId: StorageId, key: string, newValue: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOMStorage.domStorageItemAdded", "params": { "storageId": storageId, "key": key, "newValue": newValue } } )); 
    }
    domStorageItemUpdated(storageId: StorageId, key: string, oldValue: string, newValue: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "DOMStorage.domStorageItemUpdated", "params": { "storageId": storageId, "key": key, "oldValue": oldValue, "newValue": newValue } } )); 
    }
}
}

// Database
export namespace DatabaseDomain {
// Unique identifier of Database object.
export type DatabaseId = string

export interface Database {
    // Database ID.
    id: DatabaseId;
    // Database domain.
    domain: string;
    // Database name.
    name: string;
    // Database version.
    version: string;
}

export interface Error {
    // Error message.
    message: string;
    // Error code.
    code: number;
}

export interface GetDatabaseTableNamesMethodArguments { 
    databaseId: DatabaseId
}
export interface ExecuteSQLMethodArguments { 
    databaseId: DatabaseId,
    query: string
}
export interface DatabaseDomainDispatcher { 
    // Enables database tracking, database events will now be delivered to the client.
    enable(): void;
    // Disables database tracking, prevents database events from being sent to the client.
    disable(): void;
    getDatabaseTableNames(params: GetDatabaseTableNamesMethodArguments): { tableNames: string[] };
    executeSQL(params: ExecuteSQLMethodArguments): { columnNames?: string[], values?: any[], sqlError?: Error };
}
export class DatabaseFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    addDatabase(database: Database): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Database.addDatabase", "params": { "database": database } } )); 
    }
}
}

// Debugger
// Debugger domain exposes JavaScript debugging capabilities. It allows setting and removing breakpoints, stepping through execution, exploring stack traces, etc.
export namespace DebuggerDomain {
// Breakpoint identifier.
export type BreakpointId = string
// Breakpoint action identifier.
export type BreakpointActionIdentifier = number
// Unique script identifier.
export type ScriptId = string
// Call frame identifier.
export type CallFrameId = string

export interface Location {
    // Script identifier as reported in the <code>Debugger.scriptParsed</code>.
    scriptId: ScriptId;
    // Line number in the script.
    lineNumber: number;
    // Column number in the script.
    columnNumber?: number;
}

export interface BreakpointAction {
    // Different kinds of breakpoint actions.
    type: any /* log,evaluate,sound,probe */;
    // Data associated with this breakpoint type (e.g. for type "eval" this is the JavaScript string to evalulate).
    data?: string;
    // A frontend-assigned identifier for this breakpoint action.
    id?: BreakpointActionIdentifier;
}

export interface BreakpointOptions {
    // Expression to use as a breakpoint condition. When specified, debugger will only stop on the breakpoint if this expression evaluates to true.
    condition?: string;
    // Actions to perform automatically when the breakpoint is triggered.
    actions?: BreakpointAction[];
    // Automatically continue after hitting this breakpoint and running actions.
    autoContinue?: boolean;
}

export interface FunctionDetails {
    // Location of the function.
    location: Location;
    // Name of the function. Not present for anonymous functions.
    name?: string;
    // Display name of the function(specified in 'displayName' property on the function object).
    displayName?: string;
    // Name of the function inferred from its initial assignment.
    inferredName?: string;
    // Scope chain for this closure.
    scopeChain?: Scope[];
}

export interface CallFrame {
    // Call frame identifier. This identifier is only valid while the virtual machine is paused.
    callFrameId: CallFrameId;
    // Name of the JavaScript function called on this call frame.
    functionName: string;
    // Location in the source code.
    location: Location;
    // Scope chain for this call frame.
    scopeChain: Scope[];
    // <code>this</code> object for this call frame.
    this: RuntimeDomain.RemoteObject;
}

export interface Scope {
    // Scope type.
    type: any /* global,local,with,closure,catch,functionName */;
    // Object representing the scope. For <code>global</code> and <code>with</code> scopes it represents the actual object; for the rest of the scopes, it is artificial transient object enumerating scope variables as its properties.
    object: RuntimeDomain.RemoteObject;
}

export interface ProbeSample {
    // Identifier of the probe breakpoint action that created the sample.
    probeId: BreakpointActionIdentifier;
    // Unique identifier for this sample.
    sampleId: number;
    // A batch identifier which is the same for all samples taken at the same breakpoint hit.
    batchId: number;
    // Timestamp of when the sample was taken.
    timestamp: number;
    // Contents of the sample.
    payload: RuntimeDomain.RemoteObject;
}

export interface AssertPauseReason {
    // The console.assert message string if provided.
    message?: string;
}

export interface BreakpointPauseReason {
    // The identifier of the breakpoint causing the pause.
    breakpointId: string;
}

export interface CSPViolationPauseReason {
    // The CSP directive that blocked script execution.
    directive: string;
}

export interface SetBreakpointsActiveMethodArguments { 
    // New value for breakpoints active state. 
    active: boolean
}
export interface SetBreakpointByUrlMethodArguments { 
    // Line number to set breakpoint at. 
    lineNumber: number,
    // URL of the resources to set breakpoint on. 
    url?: string,
    // Regex pattern for the URLs of the resources to set breakpoints on. Either <code>url</code> or <code>urlRegex</code> must be specified. 
    urlRegex?: string,
    // Offset in the line to set breakpoint at. 
    columnNumber?: number,
    // Options to apply to this breakpoint to modify its behavior. 
    options?: BreakpointOptions
}
export interface SetBreakpointMethodArguments { 
    // Location to set breakpoint in. 
    location: Location,
    // Options to apply to this breakpoint to modify its behavior. 
    options?: BreakpointOptions
}
export interface RemoveBreakpointMethodArguments { 
    breakpointId: BreakpointId
}
export interface ContinueToLocationMethodArguments { 
    // Location to continue to. 
    location: Location
}
export interface SearchInContentMethodArguments { 
    // Id of the script to search in. 
    scriptId: ScriptId,
    // String to search for. 
    query: string,
    // If true, search is case sensitive. 
    caseSensitive?: boolean,
    // If true, treats string parameter as regex. 
    isRegex?: boolean
}
export interface GetScriptSourceMethodArguments { 
    // Id of the script to get source for. 
    scriptId: ScriptId
}
export interface GetFunctionDetailsMethodArguments { 
    // Id of the function to get location for. 
    functionId: RuntimeDomain.RemoteObjectId
}
export interface SetPauseOnExceptionsMethodArguments { 
    // Pause on exceptions mode. 
    state: any /* none,uncaught,all */
}
export interface EvaluateOnCallFrameMethodArguments { 
    // Call frame identifier to evaluate on. 
    callFrameId: CallFrameId,
    // Expression to evaluate. 
    expression: string,
    // String object group name to put result into (allows rapid releasing resulting object handles using <code>releaseObjectGroup</code>). 
    objectGroup?: string,
    // Specifies whether command line API should be available to the evaluated expression, defaults to false. 
    includeCommandLineAPI?: boolean,
    // Specifies whether evaluation should stop on exceptions and mute console. Overrides setPauseOnException state. 
    doNotPauseOnExceptionsAndMuteConsole?: boolean,
    // Whether the result is expected to be a JSON object that should be sent by value. 
    returnByValue?: boolean,
    // Whether preview should be generated for the result. 
    generatePreview?: boolean,
    // Whether the resulting value should be considered for saving in the $n history. 
    saveResult?: boolean
}
export interface SetOverlayMessageMethodArguments { 
    // Overlay message to display when paused in debugger. 
    message?: string
}
export interface DebuggerDomainDispatcher { 
    // Enables debugger for the given page. Clients should not assume that the debugging has been enabled until the result for this command is received.
    enable(): void;
    // Disables debugger for given page.
    disable(): void;
    // Activates / deactivates all breakpoints on the page.
    setBreakpointsActive(params: SetBreakpointsActiveMethodArguments): void;
    // Sets JavaScript breakpoint at given location specified either by URL or URL regex. Once this command is issued, all existing parsed scripts will have breakpoints resolved and returned in <code>locations</code> property. Further matching script parsing will result in subsequent <code>breakpointResolved</code> events issued. This logical breakpoint will survive page reloads.
    setBreakpointByUrl(params: SetBreakpointByUrlMethodArguments): { breakpointId: BreakpointId, locations: Location[] };
    // Sets JavaScript breakpoint at a given location.
    setBreakpoint(params: SetBreakpointMethodArguments): { breakpointId: BreakpointId, actualLocation: Location };
    // Removes JavaScript breakpoint.
    removeBreakpoint(params: RemoveBreakpointMethodArguments): void;
    // Continues execution until specific location is reached.
    continueToLocation(params: ContinueToLocationMethodArguments): void;
    // Steps over the statement.
    stepOver(): void;
    // Steps into the function call.
    stepInto(): void;
    // Steps out of the function call.
    stepOut(): void;
    // Stops on the next JavaScript statement.
    pause(): void;
    // Resumes JavaScript execution.
    resume(): void;
    // Searches for given string in script content.
    searchInContent(params: SearchInContentMethodArguments): { result: GenericTypesDomain.SearchMatch[] };
    // Returns source for the script with given id.
    getScriptSource(params: GetScriptSourceMethodArguments): { scriptSource: string };
    // Returns detailed information on given function.
    getFunctionDetails(params: GetFunctionDetailsMethodArguments): { details: FunctionDetails };
    // Defines pause on exceptions state. Can be set to stop on all exceptions, uncaught exceptions or no exceptions. Initial pause on exceptions state is <code>none</code>.
    setPauseOnExceptions(params: SetPauseOnExceptionsMethodArguments): void;
    // Evaluates expression on a given call frame.
    evaluateOnCallFrame(params: EvaluateOnCallFrameMethodArguments): { result: RuntimeDomain.RemoteObject, wasThrown?: boolean, savedResultIndex?: number };
    // Sets overlay message.
    setOverlayMessage(params: SetOverlayMessageMethodArguments): void;
}
export class DebuggerFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Called when global has been cleared and debugger client should reset its state. Happens upon navigation or reload.
    globalObjectCleared(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.globalObjectCleared", "params": {  } } )); 
    }
    // Fired when virtual machine parses script. This event is also fired for all known and uncollected scripts upon enabling debugger.
    scriptParsed(scriptId: ScriptId, url: string, startLine: number, startColumn: number, endLine: number, endColumn: number, isContentScript?: boolean, sourceMapURL?: string, hasSourceURL?: boolean): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.scriptParsed", "params": { "scriptId": scriptId, "url": url, "startLine": startLine, "startColumn": startColumn, "endLine": endLine, "endColumn": endColumn, "isContentScript": isContentScript, "sourceMapURL": sourceMapURL, "hasSourceURL": hasSourceURL } } )); 
    }
    // Fired when virtual machine fails to parse the script.
    scriptFailedToParse(url: string, scriptSource: string, startLine: number, errorLine: number, errorMessage: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.scriptFailedToParse", "params": { "url": url, "scriptSource": scriptSource, "startLine": startLine, "errorLine": errorLine, "errorMessage": errorMessage } } )); 
    }
    // Fired when breakpoint is resolved to an actual script and location.
    breakpointResolved(breakpointId: BreakpointId, location: Location): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.breakpointResolved", "params": { "breakpointId": breakpointId, "location": location } } )); 
    }
    // Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.
    paused(callFrames: CallFrame[], reason: any /* XHR,DOM,EventListener,exception,assert,CSPViolation,DebuggerStatement,Breakpoint,PauseOnNextStatement,other */, data?: Object): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.paused", "params": { "callFrames": callFrames, "reason": reason, "data": data } } )); 
    }
    // Fired when the virtual machine resumed execution.
    resumed(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.resumed", "params": {  } } )); 
    }
    // Fires when a new probe sample is collected.
    didSampleProbe(sample: ProbeSample): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.didSampleProbe", "params": { "sample": sample } } )); 
    }
    // Fired when a "sound" breakpoint action is triggered on a breakpoint.
    playBreakpointActionSound(breakpointActionId: BreakpointActionIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Debugger.playBreakpointActionSound", "params": { "breakpointActionId": breakpointActionId } } )); 
    }
}
}

// GenericTypes
// Exposes generic types to be used by any domain.
export namespace GenericTypesDomain {

export interface SearchMatch {
    // Line number in resource content.
    lineNumber: number;
    // Line with match content.
    lineContent: string;
}

}

// IndexedDB
export namespace IndexedDBDomain {

export interface DatabaseWithObjectStores {
    // Database name.
    name: string;
    // Database version.
    version: number;
    // Object stores in this database.
    objectStores: ObjectStore[];
}

export interface ObjectStore {
    // Object store name.
    name: string;
    // Object store key path.
    keyPath: KeyPath;
    // If true, object store has auto increment flag set.
    autoIncrement: boolean;
    // Indexes in this object store.
    indexes: ObjectStoreIndex[];
}

export interface ObjectStoreIndex {
    // Index name.
    name: string;
    // Index key path.
    keyPath: KeyPath;
    // If true, index is unique.
    unique: boolean;
    // If true, index allows multiple entries for a key.
    multiEntry: boolean;
}

export interface Key {
    // Key type.
    type: any /* number,string,date,array */;
    // Number value.
    number?: number;
    // String value.
    string?: string;
    // Date value.
    date?: number;
    // Array value.
    array?: Key[];
}

export interface KeyRange {
    // Lower bound.
    lower?: Key;
    // Upper bound.
    upper?: Key;
    // If true lower bound is open.
    lowerOpen: boolean;
    // If true upper bound is open.
    upperOpen: boolean;
}

export interface DataEntry {
    // Key.
    key: RuntimeDomain.RemoteObject;
    // Primary key.
    primaryKey: RuntimeDomain.RemoteObject;
    // Value.
    value: RuntimeDomain.RemoteObject;
}

export interface KeyPath {
    // Key path type.
    type: any /* null,string,array */;
    // String value.
    string?: string;
    // Array value.
    array?: string[];
}

export interface RequestDatabaseNamesMethodArguments { 
    // Security origin. 
    securityOrigin: string
}
export interface RequestDatabaseMethodArguments { 
    // Security origin. 
    securityOrigin: string,
    // Database name. 
    databaseName: string
}
export interface RequestDataMethodArguments { 
    // Security origin. 
    securityOrigin: string,
    // Database name. 
    databaseName: string,
    // Object store name. 
    objectStoreName: string,
    // Index name, empty string for object store data requests. 
    indexName: string,
    // Number of records to skip. 
    skipCount: number,
    // Number of records to fetch. 
    pageSize: number,
    // Key range. 
    keyRange?: KeyRange
}
export interface ClearObjectStoreMethodArguments { 
    // Security origin. 
    securityOrigin: string,
    // Database name. 
    databaseName: string,
    // Object store name. 
    objectStoreName: string
}
export interface IndexedDBDomainDispatcher { 
    // Enables events from backend.
    enable(): void;
    // Disables events from backend.
    disable(): void;
    // Requests database names for given security origin.
    requestDatabaseNames(params: RequestDatabaseNamesMethodArguments): { databaseNames: string[] };
    // Requests database with given name in given frame.
    requestDatabase(params: RequestDatabaseMethodArguments): { databaseWithObjectStores: DatabaseWithObjectStores };
    // Requests data from object store or index.
    requestData(params: RequestDataMethodArguments): { objectStoreDataEntries: DataEntry[], hasMore: boolean };
    // Clears all entries from an object store.
    clearObjectStore(params: ClearObjectStoreMethodArguments): void;
}
}

// Inspector
export namespace InspectorDomain {

export interface InspectorDomainDispatcher { 
    // Enables inspector domain notifications.
    enable(): void;
    // Disables inspector domain notifications.
    disable(): void;
    // Sent by the frontend after all initialization messages have been sent.
    initialized(): void;
}
export class InspectorFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    evaluateForTestInFrontend(script: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Inspector.evaluateForTestInFrontend", "params": { "script": script } } )); 
    }
    inspect(object: RuntimeDomain.RemoteObject, hints: Object): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Inspector.inspect", "params": { "object": object, "hints": hints } } )); 
    }
    // Fired when remote debugging connection is about to be terminated. Contains detach reason.
    detached(reason: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Inspector.detached", "params": { "reason": reason } } )); 
    }
    // Fired when the backend has alternate domains that need to be activated.
    activateExtraDomains(domains: string[]): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Inspector.activateExtraDomains", "params": { "domains": domains } } )); 
    }
    // Fired when debugging target has crashed
    targetCrashed(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Inspector.targetCrashed", "params": {  } } )); 
    }
}
}

// LayerTree
export namespace LayerTreeDomain {
// Unique RenderLayer identifier.
export type LayerId = string
// Unique PseudoElement identifier.
export type PseudoElementId = string

export interface IntRect {
    // The x position.
    x: number;
    // The y position.
    y: number;
    // The width metric.
    width: number;
    // The height metric.
    height: number;
}

export interface Layer {
    // The unique id for this layer.
    layerId: LayerId;
    // The id for the node associated with this layer.
    nodeId: DOMDomain.NodeId;
    // Bounds of the layer in absolute page coordinates.
    bounds: IntRect;
    // Indicates how many time this layer has painted.
    paintCount: number;
    // Estimated memory used by this layer.
    memory: number;
    // The bounds of the composited layer.
    compositedBounds: IntRect;
    // Indicates whether this layer is associated with an element hosted in a shadow tree.
    isInShadowTree?: boolean;
    // Indicates whether this layer was used to provide a reflection for the element.
    isReflection?: boolean;
    // Indicates whether the layer is attached to a pseudo element that is CSS generated content.
    isGeneratedContent?: boolean;
    // Indicates whether the layer was created for a CSS anonymous block or box.
    isAnonymous?: boolean;
    // The id for the pseudo element associated with this layer.
    pseudoElementId?: PseudoElementId;
    // The name of the CSS pseudo-element that prompted the layer to be generated.
    pseudoElement?: string;
}

export interface CompositingReasons {
    // Composition due to association with an element with a CSS 3D transform.
    transform3D?: boolean;
    // Composition due to association with a <video> element.
    video?: boolean;
    // Composition due to the element being a <canvas> element.
    canvas?: boolean;
    // Composition due to association with a plugin.
    plugin?: boolean;
    // Composition due to association with an <iframe> element.
    iFrame?: boolean;
    // Composition due to association with an element with a "backface-visibility: hidden" style.
    backfaceVisibilityHidden?: boolean;
    // Composition due to association with an element clipping compositing descendants.
    clipsCompositingDescendants?: boolean;
    // Composition due to association with an animated element.
    animation?: boolean;
    // Composition due to association with an element with CSS filters applied.
    filters?: boolean;
    // Composition due to association with an element with a "position: fixed" style.
    positionFixed?: boolean;
    // Composition due to association with an element with a "position: sticky" style.
    positionSticky?: boolean;
    // Composition due to association with an element with a "overflow-scrolling: touch" style.
    overflowScrollingTouch?: boolean;
    // Composition due to association with an element establishing a stacking context.
    stacking?: boolean;
    // Composition due to association with an element overlapping other composited elements.
    overlap?: boolean;
    // Composition due to association with an element with descendants that have a negative z-index.
    negativeZIndexChildren?: boolean;
    // Composition due to association with an element with composited descendants.
    transformWithCompositedDescendants?: boolean;
    // Composition due to association with an element with opacity applied and composited descendants.
    opacityWithCompositedDescendants?: boolean;
    // Composition due to association with a masked element and composited descendants.
    maskWithCompositedDescendants?: boolean;
    // Composition due to association with an element with a reflection and composited descendants.
    reflectionWithCompositedDescendants?: boolean;
    // Composition due to association with an element with CSS filters applied and composited descendants.
    filterWithCompositedDescendants?: boolean;
    // Composition due to association with an element with CSS blending applied and composited descendants.
    blendingWithCompositedDescendants?: boolean;
    // Composition due to association with an element isolating compositing descendants having CSS blending applied.
    isolatesCompositedBlendingDescendants?: boolean;
    // Composition due to association with an element with perspective applied.
    perspective?: boolean;
    // Composition due to association with an element with a "transform-style: preserve-3d" style.
    preserve3D?: boolean;
    // Composition due to association with the root element.
    root?: boolean;
    // Composition due to association with an element with a "blend-mode" style.
    blending?: boolean;
}

export interface LayersForNodeMethodArguments { 
    // Root of the subtree for which we want to gather layers. 
    nodeId: DOMDomain.NodeId
}
export interface ReasonsForCompositingLayerMethodArguments { 
    // The id of the layer for which we want to get the reasons it was composited. 
    layerId: LayerId
}
export interface LayerTreeDomainDispatcher { 
    // Enables compositing tree inspection.
    enable(): void;
    // Disables compositing tree inspection.
    disable(): void;
    // Returns the layer tree structure of the current page.
    layersForNode(params: LayersForNodeMethodArguments): { layers: Layer[] };
    // Provides the reasons why the given layer was composited.
    reasonsForCompositingLayer(params: ReasonsForCompositingLayerMethodArguments): { compositingReasons: CompositingReasons };
}
export class LayerTreeFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    layerTreeDidChange(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "LayerTree.layerTreeDidChange", "params": {  } } )); 
    }
}
}

// Network
// Network domain allows tracking network activities of the page. It exposes information about http, file, data and other requests and responses, their headers, bodies, timing, etc.
export namespace NetworkDomain {
// Unique loader identifier.
export type LoaderId = string
// Unique frame identifier.
export type FrameId = string
// Unique request identifier.
export type RequestId = string
// Number of seconds since epoch.
export type Timestamp = number

export interface Headers {
}

export interface ResourceTiming {
    // Timing's navigationStart is a baseline in seconds, while the other numbers are ticks in milliseconds relatively to this navigationStart.
    navigationStart: number;
    // Started DNS address resolve.
    domainLookupStart: number;
    // Finished DNS address resolve.
    domainLookupEnd: number;
    // Started connecting to the remote host.
    connectStart: number;
    // Connected to the remote host.
    connectEnd: number;
    // Started SSL handshake.
    secureConnectionStart: number;
    // Started sending request.
    requestStart: number;
    // Started receiving response headers.
    responseStart: number;
}

export interface Request {
    // Request URL.
    url: string;
    // HTTP request method.
    method: string;
    // HTTP request headers.
    headers: Headers;
    // HTTP POST request data.
    postData?: string;
}

export interface Response {
    // Response URL. This URL can be different from CachedResource.url in case of redirect.
    url: string;
    // HTTP response status code.
    status: number;
    // HTTP response status text.
    statusText: string;
    // HTTP response headers.
    headers: Headers;
    // HTTP response headers text.
    headersText?: string;
    // Resource mimeType as determined by the browser.
    mimeType: string;
    // Refined HTTP request headers that were actually transmitted over the network.
    requestHeaders?: Headers;
    // HTTP request headers text.
    requestHeadersText?: string;
    // Specifies that the request was served from the disk cache.
    fromDiskCache?: boolean;
    // Timing information for the given request.
    timing?: ResourceTiming;
}

export interface WebSocketRequest {
    // HTTP response headers.
    headers: Headers;
}

export interface WebSocketResponse {
    // HTTP response status code.
    status: number;
    // HTTP response status text.
    statusText: string;
    // HTTP response headers.
    headers: Headers;
}

export interface WebSocketFrame {
    // WebSocket frame opcode.
    opcode: number;
    // WebSocket frame mask.
    mask: boolean;
    // WebSocket frame payload data.
    payloadData: string;
}

export interface CachedResource {
    // Resource URL. This is the url of the original network request.
    url: string;
    // Type of this resource.
    type: PageDomain.ResourceType;
    // Cached response data.
    response?: Response;
    // Cached response body size.
    bodySize: number;
    // URL of source map associated with this resource (if any).
    sourceMapURL?: string;
}

export interface Initiator {
    // Type of this initiator.
    type: any /* parser,script,other */;
    // Initiator JavaScript stack trace, set for Script only.
    stackTrace?: ConsoleDomain.CallFrame[];
    // Initiator URL, set for Parser type only.
    url?: string;
    // Initiator line number, set for Parser type only.
    lineNumber?: number;
}

export interface SetExtraHTTPHeadersMethodArguments { 
    // Map with extra HTTP headers. 
    headers: Headers
}
export interface GetResponseBodyMethodArguments { 
    // Identifier of the network request to get content for. 
    requestId: RequestId
}
export interface SetCacheDisabledMethodArguments { 
    // Cache disabled state. 
    cacheDisabled: boolean
}
export interface LoadResourceMethodArguments { 
    // Frame to load the resource from. 
    frameId: FrameId,
    // URL of the resource to load. 
    url: string
}
export interface NetworkDomainDispatcher { 
    // Enables network tracking, network events will now be delivered to the client.
    enable(): void;
    // Disables network tracking, prevents network events from being sent to the client.
    disable(): void;
    // Specifies whether to always send extra HTTP headers with the requests from this page.
    setExtraHTTPHeaders(params: SetExtraHTTPHeadersMethodArguments): void;
    // Returns content served for the given request.
    getResponseBody(params: GetResponseBodyMethodArguments): { body: string, base64Encoded: boolean };
    // Tells whether clearing browser cache is supported.
    canClearBrowserCache(): { result: boolean };
    // Clears browser cache.
    clearBrowserCache(): void;
    // Tells whether clearing browser cookies is supported.
    canClearBrowserCookies(): { result: boolean };
    // Clears browser cookies.
    clearBrowserCookies(): void;
    // Toggles ignoring cache for each request. If <code>true</code>, cache will not be used.
    setCacheDisabled(params: SetCacheDisabledMethodArguments): void;
    // Loads a resource in the context of a frame on the inspected page without cross origin checks.
    loadResource(params: LoadResourceMethodArguments): { content: string, mimeType: string, status: number };
}
export class NetworkFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Fired when page is about to send HTTP request.
    requestWillBeSent(requestId: RequestId, frameId: FrameId, loaderId: LoaderId, documentURL: string, request: Request, timestamp: Timestamp, initiator: Initiator, redirectResponse?: Response, type?: PageDomain.ResourceType): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.requestWillBeSent", "params": { "requestId": requestId, "frameId": frameId, "loaderId": loaderId, "documentURL": documentURL, "request": request, "timestamp": timestamp, "initiator": initiator, "redirectResponse": redirectResponse, "type": type } } )); 
    }
    // Fired if request ended up loading from cache.
    requestServedFromCache(requestId: RequestId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.requestServedFromCache", "params": { "requestId": requestId } } )); 
    }
    // Fired when HTTP response is available.
    responseReceived(requestId: RequestId, frameId: FrameId, loaderId: LoaderId, timestamp: Timestamp, type: PageDomain.ResourceType, response: Response): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.responseReceived", "params": { "requestId": requestId, "frameId": frameId, "loaderId": loaderId, "timestamp": timestamp, "type": type, "response": response } } )); 
    }
    // Fired when data chunk was received over the network.
    dataReceived(requestId: RequestId, timestamp: Timestamp, dataLength: number, encodedDataLength: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.dataReceived", "params": { "requestId": requestId, "timestamp": timestamp, "dataLength": dataLength, "encodedDataLength": encodedDataLength } } )); 
    }
    // Fired when HTTP request has finished loading.
    loadingFinished(requestId: RequestId, timestamp: Timestamp, sourceMapURL?: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.loadingFinished", "params": { "requestId": requestId, "timestamp": timestamp, "sourceMapURL": sourceMapURL } } )); 
    }
    // Fired when HTTP request has failed to load.
    loadingFailed(requestId: RequestId, timestamp: Timestamp, errorText: string, canceled?: boolean): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.loadingFailed", "params": { "requestId": requestId, "timestamp": timestamp, "errorText": errorText, "canceled": canceled } } )); 
    }
    // Fired when HTTP request has been served from memory cache.
    requestServedFromMemoryCache(requestId: RequestId, frameId: FrameId, loaderId: LoaderId, documentURL: string, timestamp: Timestamp, initiator: Initiator, resource: CachedResource): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.requestServedFromMemoryCache", "params": { "requestId": requestId, "frameId": frameId, "loaderId": loaderId, "documentURL": documentURL, "timestamp": timestamp, "initiator": initiator, "resource": resource } } )); 
    }
    // Fired when WebSocket is about to initiate handshake.
    webSocketWillSendHandshakeRequest(requestId: RequestId, timestamp: Timestamp, request: WebSocketRequest): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.webSocketWillSendHandshakeRequest", "params": { "requestId": requestId, "timestamp": timestamp, "request": request } } )); 
    }
    // Fired when WebSocket handshake response becomes available.
    webSocketHandshakeResponseReceived(requestId: RequestId, timestamp: Timestamp, response: WebSocketResponse): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.webSocketHandshakeResponseReceived", "params": { "requestId": requestId, "timestamp": timestamp, "response": response } } )); 
    }
    // Fired upon WebSocket creation.
    webSocketCreated(requestId: RequestId, url: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.webSocketCreated", "params": { "requestId": requestId, "url": url } } )); 
    }
    // Fired when WebSocket is closed.
    webSocketClosed(requestId: RequestId, timestamp: Timestamp): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.webSocketClosed", "params": { "requestId": requestId, "timestamp": timestamp } } )); 
    }
    // Fired when WebSocket frame is received.
    webSocketFrameReceived(requestId: RequestId, timestamp: Timestamp, response: WebSocketFrame): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.webSocketFrameReceived", "params": { "requestId": requestId, "timestamp": timestamp, "response": response } } )); 
    }
    // Fired when WebSocket frame error occurs.
    webSocketFrameError(requestId: RequestId, timestamp: Timestamp, errorMessage: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.webSocketFrameError", "params": { "requestId": requestId, "timestamp": timestamp, "errorMessage": errorMessage } } )); 
    }
    // Fired when WebSocket frame is sent.
    webSocketFrameSent(requestId: RequestId, timestamp: Timestamp, response: WebSocketFrame): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Network.webSocketFrameSent", "params": { "requestId": requestId, "timestamp": timestamp, "response": response } } )); 
    }
}
}

// OverlayTypes
// Exposes types to be used by the inspector overlay.
export namespace OverlayTypesDomain {

export interface Point {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Region {
    borderQuad: Point[];
    incomingQuad: Point[];
    outgoingQuad: Point[];
    isHighlighted?: boolean;
}

export interface RegionFlowData {
    regions: Region[];
    name: string;
}

export interface ContentFlowData {
    name: string;
}

export interface ShapeOutsideData {
    // Bounds for the shape-outside paths.
    bounds: Point[];
    // Path for the element's shape.
    shape?: any[];
    // Path for the element's margin shape.
    marginShape?: any[];
}

export interface ElementData {
    tagName: string;
    // The value of the element's 'id' attribute.
    idValue: string;
    className?: string;
    size?: Size;
    // Computed accessibility role for the element.
    role?: string;
    regionFlowData?: RegionFlowData;
    contentFlowData?: ContentFlowData;
    shapeOutsideData?: ShapeOutsideData;
}

export interface FragmentHighlightData {
    // Quads for which the highlight should be applied.
    quads: Point[][];
    contentColor: string;
    contentOutlineColor: string;
    paddingColor: string;
    borderColor: string;
    marginColor: string;
    regionClippingArea?: Point[];
}

export interface NodeHighlightData {
    // Scroll offset for the MainFrame's FrameView that is shared across all quads.
    scrollOffset: Point;
    fragments: FragmentHighlightData[];
    elementData?: ElementData;
}

export interface OverlayConfiguration {
    deviceScaleFactor: number;
    viewportSize: Size;
    frameViewFullSize: Size;
}

}

// Page
// Actions and events related to the inspected page belong to the page domain.
export namespace PageDomain {
// Unique script identifier.
export type ScriptIdentifier = string

export interface Frame {
    // Frame unique identifier.
    id: string;
    // Parent frame identifier.
    parentId?: string;
    // Identifier of the loader associated with this frame.
    loaderId: NetworkDomain.LoaderId;
    // Frame's name as specified in the tag.
    name?: string;
    // Frame document's URL.
    url: string;
    // Frame document's security origin.
    securityOrigin: string;
    // Frame document's mimeType as determined by the browser.
    mimeType: string;
}

export interface FrameResource {
    // Resource URL.
    url: string;
    // Type of this resource.
    type: ResourceType;
    // Resource mimeType as determined by the browser.
    mimeType: string;
    // True if the resource failed to load.
    failed?: boolean;
    // True if the resource was canceled during loading.
    canceled?: boolean;
    // URL of source map associated with this resource (if any).
    sourceMapURL?: string;
}

export interface FrameResourceTree {
    // Frame information for this tree item.
    frame: Frame;
    // Child frames.
    childFrames?: FrameResourceTree[];
    // Information about frame resources.
    resources: FrameResource[];
}

export interface SearchResult {
    // Resource URL.
    url: string;
    // Resource frame id.
    frameId: NetworkDomain.FrameId;
    // Number of matches in the resource content.
    matchesCount: number;
}

export interface Cookie {
    // Cookie name.
    name: string;
    // Cookie value.
    value: string;
    // Cookie domain.
    domain: string;
    // Cookie path.
    path: string;
    // Cookie expires.
    expires: number;
    // Cookie size.
    size: number;
    // True if cookie is http-only.
    httpOnly: boolean;
    // True if cookie is secure.
    secure: boolean;
    // True in case of session cookie.
    session: boolean;
}

export const enum ResourceType { Document, Stylesheet, Image, Font, Script, XHR, WebSocket, Other }; 

export const enum CoordinateSystem { Viewport, Page }; 

export interface AddScriptToEvaluateOnLoadMethodArguments { 
    scriptSource: string
}
export interface RemoveScriptToEvaluateOnLoadMethodArguments { 
    identifier: ScriptIdentifier
}
export interface ReloadMethodArguments { 
    // If true, browser cache is ignored (as if the user pressed Shift+refresh). 
    ignoreCache?: boolean,
    // If set, the script will be injected into all frames of the inspected page after reload. 
    scriptToEvaluateOnLoad?: string
}
export interface NavigateMethodArguments { 
    // URL to navigate the page to. 
    url: string
}
export interface DeleteCookieMethodArguments { 
    // Name of the cookie to remove. 
    cookieName: string,
    // URL to match cooke domain and path. 
    url: string
}
export interface GetResourceContentMethodArguments { 
    // Frame id to get resource for. 
    frameId: NetworkDomain.FrameId,
    // URL of the resource to get content for. 
    url: string
}
export interface SearchInResourceMethodArguments { 
    // Frame id for resource to search in. 
    frameId: NetworkDomain.FrameId,
    // URL of the resource to search in. 
    url: string,
    // String to search for. 
    query: string,
    // If true, search is case sensitive. 
    caseSensitive?: boolean,
    // If true, treats string parameter as regex. 
    isRegex?: boolean
}
export interface SearchInResourcesMethodArguments { 
    // String to search for. 
    text: string,
    // If true, search is case sensitive. 
    caseSensitive?: boolean,
    // If true, treats string parameter as regex. 
    isRegex?: boolean
}
export interface SetDocumentContentMethodArguments { 
    // Frame id to set HTML for. 
    frameId: NetworkDomain.FrameId,
    // HTML content to set. 
    html: string
}
export interface SetShowPaintRectsMethodArguments { 
    // True for showing paint rectangles 
    result: boolean
}
export interface SetScriptExecutionDisabledMethodArguments { 
    // Whether script execution should be disabled in the page. 
    value: boolean
}
export interface SetTouchEmulationEnabledMethodArguments { 
    // Whether the touch event emulation should be enabled. 
    enabled: boolean
}
export interface SetEmulatedMediaMethodArguments { 
    // Media type to emulate. Empty string disables the override. 
    media: string
}
export interface SetCompositingBordersVisibleMethodArguments { 
    // True for showing compositing borders. 
    visible: boolean
}
export interface SnapshotNodeMethodArguments { 
    // Id of the node to snapshot. 
    nodeId: DOMDomain.NodeId
}
export interface SnapshotRectMethodArguments { 
    // X coordinate 
    x: number,
    // Y coordinate 
    y: number,
    // Rectangle width 
    width: number,
    // Rectangle height 
    height: number,
    // Indicates the coordinate system of the supplied rectangle. 
    coordinateSystem: CoordinateSystem
}
export interface HandleJavaScriptDialogMethodArguments { 
    // Whether to accept or dismiss the dialog. 
    accept: boolean,
    // The text to enter into the dialog prompt before accepting. Used only if this is a prompt dialog. 
    promptText?: string
}
export interface PageDomainDispatcher { 
    // Enables page domain notifications.
    enable(): void;
    // Disables page domain notifications.
    disable(): void;
    addScriptToEvaluateOnLoad(params: AddScriptToEvaluateOnLoadMethodArguments): { identifier: ScriptIdentifier };
    removeScriptToEvaluateOnLoad(params: RemoveScriptToEvaluateOnLoadMethodArguments): void;
    // Reloads given page optionally ignoring the cache.
    reload(params: ReloadMethodArguments): void;
    // Navigates current page to the given URL.
    navigate(params: NavigateMethodArguments): void;
    // Returns all browser cookies. Depending on the backend support, will return detailed cookie information in the <code>cookies</code> field.
    getCookies(): { cookies: Cookie[] };
    // Deletes browser cookie with given name, domain and path.
    deleteCookie(params: DeleteCookieMethodArguments): void;
    // Returns present frame / resource tree structure.
    getResourceTree(): { frameTree: FrameResourceTree };
    // Returns content of the given resource.
    getResourceContent(params: GetResourceContentMethodArguments): { content: string, base64Encoded: boolean };
    // Searches for given string in resource content.
    searchInResource(params: SearchInResourceMethodArguments): { result: GenericTypesDomain.SearchMatch[] };
    // Searches for given string in frame / resource tree structure.
    searchInResources(params: SearchInResourcesMethodArguments): { result: SearchResult[] };
    // Sets given markup as the document's HTML.
    setDocumentContent(params: SetDocumentContentMethodArguments): void;
    // Requests that backend shows paint rectangles
    setShowPaintRects(params: SetShowPaintRectsMethodArguments): void;
    // Determines if scripts can be executed in the page.
    getScriptExecutionStatus(): { result: any /* allowed,disabled,forbidden */ };
    // Switches script execution in the page.
    setScriptExecutionDisabled(params: SetScriptExecutionDisabledMethodArguments): void;
    // Toggles mouse event-based touch event emulation.
    setTouchEmulationEnabled(params: SetTouchEmulationEnabledMethodArguments): void;
    // Emulates the given media for CSS media queries.
    setEmulatedMedia(params: SetEmulatedMediaMethodArguments): void;
    // Indicates the visibility of compositing borders.
    getCompositingBordersVisible(): { result: boolean };
    // Controls the visibility of compositing borders.
    setCompositingBordersVisible(params: SetCompositingBordersVisibleMethodArguments): void;
    // Capture a snapshot of the specified node that does not include unrelated layers.
    snapshotNode(params: SnapshotNodeMethodArguments): { dataURL: string };
    // Capture a snapshot of the page within the specified rectangle and coordinate system.
    snapshotRect(params: SnapshotRectMethodArguments): { dataURL: string };
    // Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).
    handleJavaScriptDialog(params: HandleJavaScriptDialogMethodArguments): void;
    // Grab an archive of the page.
    archive(): { data: string };
}
export class PageFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    domContentEventFired(timestamp: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.domContentEventFired", "params": { "timestamp": timestamp } } )); 
    }
    loadEventFired(timestamp: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.loadEventFired", "params": { "timestamp": timestamp } } )); 
    }
    // Fired once navigation of the frame has completed. Frame is now associated with the new loader.
    frameNavigated(frame: Frame): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.frameNavigated", "params": { "frame": frame } } )); 
    }
    // Fired when frame has been detached from its parent.
    frameDetached(frameId: NetworkDomain.FrameId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.frameDetached", "params": { "frameId": frameId } } )); 
    }
    // Fired when frame has started loading.
    frameStartedLoading(frameId: NetworkDomain.FrameId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.frameStartedLoading", "params": { "frameId": frameId } } )); 
    }
    // Fired when frame has stopped loading.
    frameStoppedLoading(frameId: NetworkDomain.FrameId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.frameStoppedLoading", "params": { "frameId": frameId } } )); 
    }
    // Fired when frame schedules a potential navigation.
    frameScheduledNavigation(frameId: NetworkDomain.FrameId, delay: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.frameScheduledNavigation", "params": { "frameId": frameId, "delay": delay } } )); 
    }
    // Fired when frame no longer has a scheduled navigation.
    frameClearedScheduledNavigation(frameId: NetworkDomain.FrameId): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.frameClearedScheduledNavigation", "params": { "frameId": frameId } } )); 
    }
    // Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about to open.
    javascriptDialogOpening(message: string): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.javascriptDialogOpening", "params": { "message": message } } )); 
    }
    // Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been closed.
    javascriptDialogClosed(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.javascriptDialogClosed", "params": {  } } )); 
    }
    // Fired when the JavaScript is enabled/disabled on the page
    scriptsEnabled(isEnabled: boolean): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Page.scriptsEnabled", "params": { "isEnabled": isEnabled } } )); 
    }
}
}

// Replay
// Controls web replay, and manages recording sessions and segments.
export namespace ReplayDomain {
// Unique replay session identifier.
export type SessionIdentifier = number
// Unique session segment identifier.
export type SegmentIdentifier = number

export interface ReplayPosition {
    // Offset for a segment within the currently-loaded replay session.
    segmentOffset: number;
    // Offset for an event loop input within the specified session segment.
    inputOffset: number;
}

export interface ReplayInput {
    // Input type.
    type: string;
    // Offset of this input in its respective queue.
    offset: number;
    // Per-input payload.
    data: Object;
}

export interface ReplayInputQueue {
    // Queue type
    type: string;
    // Inputs belonging to this queue.
    inputs: ReplayInput[];
}

export interface SessionSegment {
    // Unique session segment identifier.
    id: SegmentIdentifier;
    // Start time of the segment, in milliseconds since the epoch.
    timestamp: number;
    queues: ReplayInputQueue[];
}

export interface ReplaySession {
    // Unique replay session identifier.
    id: SessionIdentifier;
    // Creation time of session, in milliseconds since the epoch.
    timestamp: number;
    // An ordered list identifiers for the segments that comprise this replay session.
    segments: SegmentIdentifier[];
}

export const enum SessionState { Capturing, Inactive, Replaying }; 

export const enum SegmentState { Appending, Unloaded, Loaded, Dispatching }; 

export interface ReplayToPositionMethodArguments { 
    position: ReplayPosition,
    shouldFastForward: boolean
}
export interface ReplayToCompletionMethodArguments { 
    shouldFastForward: boolean
}
export interface SwitchSessionMethodArguments { 
    sessionIdentifier: SessionIdentifier
}
export interface InsertSessionSegmentMethodArguments { 
    sessionIdentifier: SessionIdentifier,
    segmentIdentifier: SegmentIdentifier,
    segmentIndex: number
}
export interface RemoveSessionSegmentMethodArguments { 
    sessionIdentifier: SessionIdentifier,
    segmentIndex: number
}
export interface GetSessionDataMethodArguments { 
    sessionIdentifier: SessionIdentifier
}
export interface GetSegmentDataMethodArguments { 
    id: SegmentIdentifier
}
export interface ReplayDomainDispatcher { 
    // Starts capture of a new replay session.
    startCapturing(): void;
    // Stops capture of the currently recording replay session.
    stopCapturing(): void;
    // Seek execution to a specific position within the replay session.
    replayToPosition(params: ReplayToPositionMethodArguments): void;
    // Replay all session segments completely.
    replayToCompletion(params: ReplayToCompletionMethodArguments): void;
    // Pauses playback in the current segment. Can be resumed by using a replay command.
    pausePlayback(): void;
    // Cancels playback of the current segment. Further replaying will start from the beginning of the current segment.
    cancelPlayback(): void;
    // Unloads the current replay session and loads the specified session
    switchSession(params: SwitchSessionMethodArguments): void;
    // Splices the specified session segment into the session at the specified index.
    insertSessionSegment(params: InsertSessionSegmentMethodArguments): void;
    // Removes the session segment at the specified position from the session.
    removeSessionSegment(params: RemoveSessionSegmentMethodArguments): void;
    // Returns the identifier, position, session state and segment state of the currently loaded session. This is necessary because the inspector may be closed and reopened in the middle of replay.
    currentReplayState(): { sessionIdentifier: SessionIdentifier, segmentIdentifier?: SegmentIdentifier, sessionState: SessionState, segmentState: SegmentState, replayPosition: ReplayPosition };
    // Returns identifiers of all available sessions.
    getAvailableSessions(): { ids: SessionIdentifier[] };
    // Returns an object for the specified session.
    getSessionData(params: GetSessionDataMethodArguments): { session?: ReplaySession };
    // Returns an object for the specified session segment.
    getSegmentData(params: GetSegmentDataMethodArguments): { segment?: SessionSegment };
}
export class ReplayFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Fired when capture has started.
    captureStarted(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.captureStarted", "params": {  } } )); 
    }
    // Fired when capture has stopped.
    captureStopped(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.captureStopped", "params": {  } } )); 
    }
    // Playback within the session has progressed up to this position, and is about to replay the input at the specified offset.
    playbackHitPosition(position: ReplayPosition, timestamp: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.playbackHitPosition", "params": { "position": position, "timestamp": timestamp } } )); 
    }
    // Fired when session playback has started.
    playbackStarted(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.playbackStarted", "params": {  } } )); 
    }
    // Fired when session playback has paused, but not finished.
    playbackPaused(position: ReplayPosition): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.playbackPaused", "params": { "position": position } } )); 
    }
    // Fired when session playback has stopped.
    playbackFinished(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.playbackFinished", "params": {  } } )); 
    }
    // Fired when the replay controller starts or stops suppressing user inputs.
    inputSuppressionChanged(willSuppress: boolean): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.inputSuppressionChanged", "params": { "willSuppress": willSuppress } } )); 
    }
    // Fired when a new replay session is created
    sessionCreated(id: SessionIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.sessionCreated", "params": { "id": id } } )); 
    }
    // Fired when a session's segments have changed.
    sessionModified(id: SessionIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.sessionModified", "params": { "id": id } } )); 
    }
    // Fired when a replay session is removed and can no longer be loaded.
    sessionRemoved(id: SessionIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.sessionRemoved", "params": { "id": id } } )); 
    }
    // Fired when a replay session is loaded.
    sessionLoaded(id: SessionIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.sessionLoaded", "params": { "id": id } } )); 
    }
    // Fired when a new session segment is created.
    segmentCreated(id: SegmentIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.segmentCreated", "params": { "id": id } } )); 
    }
    // Fired when a session segment is removed and can no longer be replayed as part of a session.
    segmentRemoved(id: SegmentIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.segmentRemoved", "params": { "id": id } } )); 
    }
    // Fired when a session segment is completed and can no longer have inputs added to it.
    segmentCompleted(id: SegmentIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.segmentCompleted", "params": { "id": id } } )); 
    }
    // Fired when a segment is loaded.
    segmentLoaded(segmentIdentifier: SegmentIdentifier): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.segmentLoaded", "params": { "segmentIdentifier": segmentIdentifier } } )); 
    }
    // Fired when a segment is unloaded.
    segmentUnloaded(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Replay.segmentUnloaded", "params": {  } } )); 
    }
}
}

// Runtime
// Runtime domain exposes JavaScript runtime by means of remote evaluation and mirror objects. Evaluation results are returned as mirror object that expose object type, string representation and unique identifier that can be used for further object reference. Original objects are maintained in memory unless they are either explicitly released or are released along with the other objects in their object group.
export namespace RuntimeDomain {
// Unique object identifier.
export type RemoteObjectId = string
// Id of an execution context.
export type ExecutionContextId = number

export interface RemoteObject {
    // Object type.
    type: any /* object,function,undefined,string,number,boolean,symbol */;
    // Object subtype hint. Specified for <code>object</code> <code>function</code> (for class) type values only.
    subtype?: any /* array,null,node,regexp,date,error,map,set,weakmap,weakset,iterator,class */;
    // Object class (constructor) name. Specified for <code>object</code> type values only.
    className?: string;
    // Remote object value (in case of primitive values or JSON values if it was requested).
    value?: any;
    // String representation of the object.
    description?: string;
    // Unique object identifier (for non-primitive values).
    objectId?: RemoteObjectId;
    // Size of the array/collection. Specified for array/map/set/weakmap/weakset object type values only.
    size?: number;
    // Remote object for the class prototype. Specified for class object type values only.
    classPrototype?: RemoteObject;
    // Preview containing abbreviated property values. Specified for <code>object</code> type values only.
    preview?: ObjectPreview;
}

export interface ObjectPreview {
    // Object type.
    type: any /* object,function,undefined,string,number,boolean,symbol */;
    // Object subtype hint. Specified for <code>object</code> type values only.
    subtype?: any /* array,null,node,regexp,date,error,map,set,weakmap,weakset,iterator,class */;
    // String representation of the object.
    description?: string;
    // Determines whether preview is lossless (contains all information of the original object).
    lossless: boolean;
    // True iff some of the properties of the original did not fit.
    overflow?: boolean;
    // List of the properties.
    properties?: PropertyPreview[];
    // List of the entries. Specified for <code>map</code> and <code>set</code> subtype values only.
    entries?: EntryPreview[];
    // Size of the array/collection. Specified for array/map/set/weakmap/weakset object type values only.
    size?: number;
}

export interface PropertyPreview {
    // Property name.
    name: string;
    // Object type.
    type: any /* object,function,undefined,string,number,boolean,symbol,accessor */;
    // Object subtype hint. Specified for <code>object</code> type values only.
    subtype?: any /* array,null,node,regexp,date,error,map,set,weakmap,weakset,iterator,class */;
    // User-friendly property value string.
    value?: string;
    // Nested value preview.
    valuePreview?: ObjectPreview;
    // True if this is an internal property.
    internal?: boolean;
}

export interface EntryPreview {
    // Entry key. Specified for map-like collection entries.
    key?: ObjectPreview;
    // Entry value.
    value: ObjectPreview;
}

export interface CollectionEntry {
    // Entry key of a map-like collection, otherwise not provided.
    key?: RemoteObject;
    // Entry value.
    value: RemoteObject;
}

export interface PropertyDescriptor {
    // Property name or symbol description.
    name: string;
    // The value associated with the property.
    value?: RemoteObject;
    // True if the value associated with the property may be changed (data descriptors only).
    writable?: boolean;
    // A function which serves as a getter for the property, or <code>undefined</code> if there is no getter (accessor descriptors only).
    get?: RemoteObject;
    // A function which serves as a setter for the property, or <code>undefined</code> if there is no setter (accessor descriptors only).
    set?: RemoteObject;
    // True if the type of this property descriptor may be changed and if the property may be deleted from the corresponding object.
    configurable: boolean;
    // True if this property shows up during enumeration of the properties on the corresponding object.
    enumerable: boolean;
    // True if the result was thrown during the evaluation.
    wasThrown?: boolean;
    // True if the property is owned for the object.
    isOwn?: boolean;
    // Property symbol object, if the property is a symbol.
    symbol?: RemoteObject;
    // True if the property value came from a native getter.
    nativeGetter?: boolean;
}

export interface InternalPropertyDescriptor {
    // Conventional property name.
    name: string;
    // The value associated with the property.
    value?: RemoteObject;
}

export interface CallArgument {
    // Primitive value.
    value?: any;
    // Remote object handle.
    objectId?: RemoteObjectId;
}

export interface ExecutionContextDescription {
    // Unique id of the execution context. It can be used to specify in which execution context script evaluation should be performed.
    id: ExecutionContextId;
    // True if this is a context where inpspected web page scripts run. False if it is a content script isolated context.
    isPageContext: boolean;
    // Human readable name describing given context.
    name: string;
    // Id of the owning frame.
    frameId: NetworkDomain.FrameId;
}

export interface ErrorRange {
    // Start offset of range (inclusive).
    startOffset: number;
    // End offset of range (exclusive).
    endOffset: number;
}

export interface StructureDescription {
    // Array of strings, where the strings represent object properties.
    fields?: string[];
    // Array of strings, where the strings represent optional object properties.
    optionalFields?: string[];
    // Name of the constructor.
    constructorName?: string;
    // Pointer to the StructureRepresentation of the protoype if one exists.
    prototypeStructure?: StructureDescription;
    // If true, it indicates that the fields in this StructureDescription may be inaccurate. I.e, there might have been fields that have been deleted before it was profiled or it has fields we haven't profiled.
    isImprecise?: boolean;
}

export interface TypeSet {
    // Indicates if this type description has been type Function.
    isFunction: boolean;
    // Indicates if this type description has been type Undefined.
    isUndefined: boolean;
    // Indicates if this type description has been type Null.
    isNull: boolean;
    // Indicates if this type description has been type Boolean.
    isBoolean: boolean;
    // Indicates if this type description has been type Integer.
    isInteger: boolean;
    // Indicates if this type description has been type Number.
    isNumber: boolean;
    // Indicates if this type description has been type String.
    isString: boolean;
    // Indicates if this type description has been type Object.
    isObject: boolean;
    // Indicates if this type description has been type Symbol.
    isSymbol: boolean;
}

export interface TypeDescription {
    // If true, we were able to correlate the offset successfuly with a program location. If false, the offset may be bogus or the offset may be from a CodeBlock that hasn't executed.
    isValid: boolean;
    // Least common ancestor of all Constructors if the TypeDescription has seen any structures. This string is the display name of the shared constructor function.
    leastCommonAncestor?: string;
    // Set of booleans for determining the aggregate type of this type description.
    typeSet?: TypeSet;
    // Array of descriptions for all structures seen for this variable.
    structures?: StructureDescription[];
    // If true, this indicates that no more structures are being profiled because some maximum threshold has been reached and profiling has stopped because of memory pressure.
    isTruncated?: boolean;
}

export interface TypeLocation {
    // What kind of type information do we want (normal, function return values, 'this' statement).
    typeInformationDescriptor: number;
    // sourceID uniquely identifying a script
    sourceID: string;
    // character offset for assignment range
    divot: number;
}

export interface BasicBlock {
    // Start offset of the basic block.
    startOffset: number;
    // End offset of the basic block.
    endOffset: number;
    // Indicates if the basic block has executed before.
    hasExecuted: boolean;
}

export const enum SyntaxErrorType { None, Irrecoverable, UnterminatedLiteral, Recoverable }; 

export interface ParseMethodArguments { 
    // Source code to parse. 
    source: string
}
export interface EvaluateMethodArguments { 
    // Expression to evaluate. 
    expression: string,
    // Symbolic group name that can be used to release multiple objects. 
    objectGroup?: string,
    // Determines whether Command Line API should be available during the evaluation. 
    includeCommandLineAPI?: boolean,
    // Specifies whether evaluation should stop on exceptions and mute console. Overrides setPauseOnException state. 
    doNotPauseOnExceptionsAndMuteConsole?: boolean,
    // Specifies in which isolated context to perform evaluation. Each content script lives in an isolated context and this parameter may be used to specify one of those contexts. If the parameter is omitted or 0 the evaluation will be performed in the context of the inspected page. 
    contextId?: ExecutionContextId,
    // Whether the result is expected to be a JSON object that should be sent by value. 
    returnByValue?: boolean,
    // Whether preview should be generated for the result. 
    generatePreview?: boolean,
    // Whether the resulting value should be considered for saving in the $n history. 
    saveResult?: boolean
}
export interface CallFunctionOnMethodArguments { 
    // Identifier of the object to call function on. 
    objectId: RemoteObjectId,
    // Declaration of the function to call. 
    functionDeclaration: string,
    // Call arguments. All call arguments must belong to the same JavaScript world as the target object. 
    arguments?: CallArgument[],
    // Specifies whether function call should stop on exceptions and mute console. Overrides setPauseOnException state. 
    doNotPauseOnExceptionsAndMuteConsole?: boolean,
    // Whether the result is expected to be a JSON object which should be sent by value. 
    returnByValue?: boolean,
    // Whether preview should be generated for the result. 
    generatePreview?: boolean
}
export interface GetPropertiesMethodArguments { 
    // Identifier of the object to return properties for. 
    objectId: RemoteObjectId,
    // If true, returns properties belonging only to the object itself, not to its prototype chain. 
    ownProperties?: boolean,
    // Whether preview should be generated for property values. 
    generatePreview?: boolean
}
export interface GetDisplayablePropertiesMethodArguments { 
    // Identifier of the object to return properties for. 
    objectId: RemoteObjectId,
    // Whether preview should be generated for property values. 
    generatePreview?: boolean
}
export interface GetCollectionEntriesMethodArguments { 
    // Id of the collection to get entries for. 
    objectId: RemoteObjectId,
    // Symbolic group name that can be used to release multiple. If not provided, it will be the same objectGroup as the RemoteObject determined from <code>objectId</code>. This is useful for WeakMap to release the collection entries. 
    objectGroup?: string,
    // If provided skip to this index before collecting values. Otherwise, 0. 
    startIndex?: number,
    // If provided only return <code>numberToFetch</code> values. Otherwise, return values all the way to the end. 
    numberToFetch?: number
}
export interface SaveResultMethodArguments { 
    // Id or value of the object to save. 
    value: CallArgument,
    // Unique id of the execution context. To specify in which execution context script evaluation should be performed. If not provided, determine from the CallArgument's objectId. 
    contextId?: ExecutionContextId
}
export interface ReleaseObjectMethodArguments { 
    // Identifier of the object to release. 
    objectId: RemoteObjectId
}
export interface ReleaseObjectGroupMethodArguments { 
    // Symbolic object group name. 
    objectGroup: string
}
export interface GetRuntimeTypesForVariablesAtOffsetsMethodArguments { 
    // An array of type locations we're requesting information for. Results are expected in the same order they're sent in. 
    locations: TypeLocation[]
}
export interface GetBasicBlocksMethodArguments { 
    // Indicates which sourceID information is requested for. 
    sourceID: string
}
export interface RuntimeDomainDispatcher { 
    // Parses JavaScript source code for errors.
    parse(params: ParseMethodArguments): { result: SyntaxErrorType, message?: string, range?: ErrorRange };
    // Evaluates expression on global object.
    evaluate(params: EvaluateMethodArguments): { result: RemoteObject, wasThrown?: boolean, savedResultIndex?: number };
    // Calls function with given declaration on the given object. Object group of the result is inherited from the target object.
    callFunctionOn(params: CallFunctionOnMethodArguments): { result: RemoteObject, wasThrown?: boolean };
    // Returns properties of a given object. Object group of the result is inherited from the target object.
    getProperties(params: GetPropertiesMethodArguments): { result: PropertyDescriptor[], internalProperties?: InternalPropertyDescriptor[] };
    // Returns displayable properties of a given object. Object group of the result is inherited from the target object. Displayable properties are own properties, internal properties, and native getters in the prototype chain (assumed to be bindings and treated like own properties for the frontend).
    getDisplayableProperties(params: GetDisplayablePropertiesMethodArguments): { properties: PropertyDescriptor[], internalProperties?: InternalPropertyDescriptor[] };
    // Returns entries of given Map / Set collection.
    getCollectionEntries(params: GetCollectionEntriesMethodArguments): { entries: CollectionEntry[] };
    // Assign a saved result index to this value.
    saveResult(params: SaveResultMethodArguments): { savedResultIndex?: number };
    // Releases remote object with given id.
    releaseObject(params: ReleaseObjectMethodArguments): void;
    // Releases all remote objects that belong to a given group.
    releaseObjectGroup(params: ReleaseObjectGroupMethodArguments): void;
    // Tells inspected instance(worker or page) that it can run in case it was started paused.
    run(): void;
    // Enables reporting of execution contexts creation by means of <code>executionContextCreated</code> event. When the reporting gets enabled the event will be sent immediately for each existing execution context.
    enable(): void;
    // Disables reporting of execution contexts creation.
    disable(): void;
    // Returns detailed informtation on given function.
    getRuntimeTypesForVariablesAtOffsets(params: GetRuntimeTypesForVariablesAtOffsetsMethodArguments): { types: TypeDescription[] };
    // Enables type profiling on the VM.
    enableTypeProfiler(): void;
    // Disables type profiling on the VM.
    disableTypeProfiler(): void;
    // Returns a list of basic blocks for the given sourceID with information about their text ranges and whether or not they have executed.
    getBasicBlocks(params: GetBasicBlocksMethodArguments): { basicBlocks: BasicBlock[] };
}
export class RuntimeFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Issued when new execution context is created.
    executionContextCreated(context: ExecutionContextDescription): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Runtime.executionContextCreated", "params": { "context": context } } )); 
    }
}
}

// Timeline
// Timeline provides its clients with instrumentation records that are generated during the page runtime. Timeline instrumentation can be started and stopped using corresponding commands. While timeline is started, it is generating timeline event records.
export namespace TimelineDomain {

export interface TimelineEvent {
    // Event type.
    type: EventType;
    // Event data.
    data: Object;
    // Nested records.
    children?: TimelineEvent[];
}

export interface CPUProfileNodeAggregateCallInfo {
    // Total number of calls.
    callCount: number;
    // Start time for the first call.
    startTime: number;
    // End time for the last call.
    endTime: number;
    // Total execution time for all calls combined.
    totalTime: number;
}

export interface CPUProfileNode {
    // Unique identifier for this call site.
    id: number;
    // Aggregate info about all the calls that making up this node.
    callInfo: CPUProfileNodeAggregateCallInfo;
    // Function name.
    functionName?: string;
    // URL.
    url?: string;
    // Line number.
    lineNumber?: number;
    // Column number.
    columnNumber?: number;
    // Child nodes.
    children?: CPUProfileNode[];
}

export interface CPUProfile {
    // Top level nodes in the stack.
    rootNodes: CPUProfileNode[];
    idleTime?: number;
}

export const enum EventType { EventDispatch, ScheduleStyleRecalculation, RecalculateStyles, InvalidateLayout, Layout, Paint, Composite, RenderingFrame, ScrollLayer, ParseHTML, TimerInstall, TimerRemove, TimerFire, EvaluateScript, MarkLoad, MarkDOMContent, TimeStamp, Time, TimeEnd, XHRReadyStateChange, XHRLoad, FunctionCall, ProbeSample, ConsoleProfile, GCEvent, RequestAnimationFrame, CancelAnimationFrame, FireAnimationFrame, WebSocketCreate, WebSocketSendHandshakeRequest, WebSocketReceiveHandshakeResponse, WebSocketDestroy }; 

export interface StartMethodArguments { 
    // Samples JavaScript stack traces up to <code>maxCallStackDepth</code>, defaults to 5. 
    maxCallStackDepth?: number
}
export interface TimelineDomainDispatcher { 
    // Starts capturing instrumentation events.
    start(params: StartMethodArguments): void;
    // Stops capturing instrumentation events.
    stop(): void;
}
export class TimelineFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    // Fired for every instrumentation event while timeline is started.
    eventRecorded(record: TimelineEvent): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Timeline.eventRecorded", "params": { "record": record } } )); 
    }
    // Fired when recording has started.
    recordingStarted(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Timeline.recordingStarted", "params": {  } } )); 
    }
    // Fired when recording has stopped.
    recordingStopped(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Timeline.recordingStopped", "params": {  } } )); 
    }
}
}

// Worker
export namespace WorkerDomain {

export interface SendMessageToWorkerMethodArguments { 
    workerId: number,
    message: Object
}
export interface ConnectToWorkerMethodArguments { 
    workerId: number
}
export interface DisconnectFromWorkerMethodArguments { 
    workerId: number
}
export interface SetAutoconnectToWorkersMethodArguments { 
    value: boolean
}
export interface WorkerDomainDispatcher { 
    enable(): void;
    disable(): void;
    sendMessageToWorker(params: SendMessageToWorkerMethodArguments): void;
    // Tells whether browser supports workers inspection.
    canInspectWorkers(): { result: boolean };
    connectToWorker(params: ConnectToWorkerMethodArguments): void;
    disconnectFromWorker(params: DisconnectFromWorkerMethodArguments): void;
    setAutoconnectToWorkers(params: SetAutoconnectToWorkersMethodArguments): void;
}
export class WorkerFrontend { 
    constructor(private dispatchMessage: (message: String) => void) { 
    }
    workerCreated(workerId: number, url: string, inspectorConnected: boolean): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Worker.workerCreated", "params": { "workerId": workerId, "url": url, "inspectorConnected": inspectorConnected } } )); 
    }
    workerTerminated(workerId: number): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Worker.workerTerminated", "params": { "workerId": workerId } } )); 
    }
    dispatchMessageFromWorker(workerId: number, message: Object): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Worker.dispatchMessageFromWorker", "params": { "workerId": workerId, "message": message } } )); 
    }
    disconnectedFromWorker(): void { 
        this.dispatchMessage(JSON.stringify( { "method": "Worker.disconnectedFromWorker", "params": {  } } )); 
    }
}
}