import * as inspectorCommands from './InspectorBackendCommands';

import * as debuggerDomains from '.';

import { attachDOMInspectorEventCallbacks, attachDOMInspectorCommandCallbacks } from './devtools-elements';

@inspectorCommands.DomainDispatcher('DOM')
export class DOMDomainDebugger implements inspectorCommands.DOMDomain.DOMDomainDispatcher {
	private _enabled: boolean;
	public events: inspectorCommands.DOMDomain.DOMFrontend;
	public commands: any;

	constructor() {
		this.events = new inspectorCommands.DOMDomain.DOMFrontend();

		this.commands = {};

		attachDOMInspectorEventCallbacks(this.events);
		attachDOMInspectorCommandCallbacks(this.commands);

		// By default start enabled because we can miss the "enable event when
		// running with `--debug-brk` -- the frontend will send it before we've been created
		this.enable();
	}

	get enabled(): boolean {
		return this._enabled;
	}

	enable(): void {
		if (debuggerDomains.getDOM()) {
			throw new Error('One DOMDomainDebugger may be enabled at a time.');
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

	getDocument(): { root: inspectorCommands.DOMDomain.Node } {
		const domNode = this.commands.getDocument();

		return { root: domNode };
	}

	removeNode(params: inspectorCommands.DOMDomain.RemoveNodeMethodArguments): void {
		this.commands.removeNode(params.nodeId);
	}

	setAttributeValue(params: inspectorCommands.DOMDomain.SetAttributeValueMethodArguments): void {
		throw new Error('Method not implemented.');
	}

	setAttributesAsText(params: inspectorCommands.DOMDomain.SetAttributesAsTextMethodArguments): void {
		this.commands.setAttributeAsText(params.nodeId, params.text, params.name);
	}

	removeAttribute(params: inspectorCommands.DOMDomain.RemoveAttributeMethodArguments): void {
		throw new Error('Method not implemented.');
	}

	performSearch(params: inspectorCommands.DOMDomain.PerformSearchMethodArguments): { searchId: string; resultCount: number } {
		return null;
	}

	getSearchResults(params: inspectorCommands.DOMDomain.GetSearchResultsMethodArguments): { nodeIds: inspectorCommands.DOMDomain.NodeId[] } {
		return null;
	}

	discardSearchResults(params: inspectorCommands.DOMDomain.DiscardSearchResultsMethodArguments): void {
		return;
	}

	highlightNode(params: inspectorCommands.DOMDomain.HighlightNodeMethodArguments): void {
		return;
	}

	hideHighlight(): void {
		return;
	}

	resolveNode(params: inspectorCommands.DOMDomain.ResolveNodeMethodArguments): { object: inspectorCommands.RuntimeDomain.RemoteObject } {
		return null;
	}
}
