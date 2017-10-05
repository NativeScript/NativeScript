import * as inspectorCommandTypes from "./InspectorBackendCommands.ios";
var inspectorCommands: typeof inspectorCommandTypes = require("./InspectorBackendCommands");
// var inspectorCommandTypes: any = inspectorCommands;

import * as debuggerDomains from "./debugger";
import * as devToolsElements from "./devtools-elements";

declare var __inspectorSendEvent;

// temp patch
global.__inspector = {};
var inspector: devToolsElements.Inspector = global.__inspector;

@inspectorCommands.DomainDispatcher("DOM")
export class DOMDomainDebugger implements inspectorCommandTypes.DOMDomain.DOMDomainDispatcher {

    private _enabled: boolean;
    public events: inspectorCommandTypes.DOMDomain.DOMFrontend;

    constructor() {
        this.events = new inspectorCommands.DOMDomain.DOMFrontend();

        inspector.attributeModified = this.events.attributeModified;
        inspector.attributeRemoved = this.events.attributeRemoved;
        inspector.childNodeRemoved = this.events.childNodeRemoved;

        // temp patch
        inspector.childNodeInserted = (parentId: number, lastId: number, nodeStr: string) => {
            this.events.childNodeInserted(parentId, lastId, JSON.parse(nodeStr));
        }
    }

    get enabled(): boolean {
        return this._enabled;
    }

    enable(): void {
        if (debuggerDomains.getDOM()) {
            throw new Error("One DOMDomainDebugger may be enabled at a time.");
        } else {
            debuggerDomains.setDOM(this);
        }
        this._enabled = true;
    }

    /**
     * Disables network tracking, prevents network events from being sent to the client.
     */
    disable(): void {
        if (debuggerDomains.getDOM() === this) {
            debuggerDomains.setDOM(null);
        }
        this._enabled = false;
    }

    getDocument(): { root: inspectorCommandTypes.DOMDomain.Node } {
        const res = inspector.getDocument();
        // temp patch
        const domNode = JSON.parse(res);
        return { root: domNode };
    }

    removeNode(params: inspectorCommandTypes.DOMDomain.RemoveNodeMethodArguments): void {
        inspector.removeNode(params.nodeId);
    }
    
    setAttributeValue(params: inspectorCommandTypes.DOMDomain.SetAttributeValueMethodArguments): void {
        throw new Error("Method not implemented.");
    }

    setAttributesAsText(params: inspectorCommandTypes.DOMDomain.SetAttributesAsTextMethodArguments): void {
        inspector.setAttributeAsText(params.nodeId, params.text, params.name);
    }

    removeAttribute(params: inspectorCommandTypes.DOMDomain.RemoveAttributeMethodArguments): void {
        throw new Error("Method not implemented.");
    }

    performSearch(params: inspectorCommandTypes.DOMDomain.PerformSearchMethodArguments): { searchId: string, resultCount: number } {
        return null;
    }
	
    getSearchResults(params: inspectorCommandTypes.DOMDomain.GetSearchResultsMethodArguments): { nodeIds: inspectorCommandTypes.DOMDomain.NodeId[] } {
        return null;
    }
	
    discardSearchResults(params: inspectorCommandTypes.DOMDomain.DiscardSearchResultsMethodArguments): void {

    }
	
    highlightNode(params: inspectorCommandTypes.DOMDomain.HighlightNodeMethodArguments): void {

    }
	
    hideHighlight(): void {

    }
	
    resolveNode(params: inspectorCommandTypes.DOMDomain.ResolveNodeMethodArguments): { object: inspectorCommandTypes.RuntimeDomain.RemoteObject } {
        return null;
    }
}
