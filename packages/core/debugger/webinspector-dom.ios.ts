import * as inspectorCommandTypes from './InspectorBackendCommands.ios';
const inspectorCommands: typeof inspectorCommandTypes = require('./InspectorBackendCommands');

import * as debuggerDomains from '.';

import { attachDOMInspectorEventCallbacks, attachDOMInspectorCommandCallbacks } from './devtools-elements';

@inspectorCommands.DomainDispatcher('DOM')
export class DOMDomainDebugger implements inspectorCommandTypes.DOMDomain.DOMDomainDispatcher {
	private _enabled: boolean;
	public events: inspectorCommandTypes.DOMDomain.DOMFrontend;
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

	getDocument(): { root: inspectorCommandTypes.DOMDomain.Node } {
		const domNode = this.commands.getDocument();

		return { root: domNode };
	}

	removeNode(params: inspectorCommandTypes.DOMDomain.RemoveNodeMethodArguments): void {
		this.commands.removeNode(params.nodeId);
	}

	setAttributeValue(params: inspectorCommandTypes.DOMDomain.SetAttributeValueMethodArguments): void {
		throw new Error('Method not implemented.');
	}

	setAttributesAsText(params: inspectorCommandTypes.DOMDomain.SetAttributesAsTextMethodArguments): void {
		this.commands.setAttributeAsText(params.nodeId, params.text, params.name);
	}

	removeAttribute(params: inspectorCommandTypes.DOMDomain.RemoveAttributeMethodArguments): void {
		throw new Error('Method not implemented.');
	}

	performSearch(params: inspectorCommandTypes.DOMDomain.PerformSearchMethodArguments): { searchId: string; resultCount: number } {
		return null;
	}

	getSearchResults(params: inspectorCommandTypes.DOMDomain.GetSearchResultsMethodArguments): { nodeIds: inspectorCommandTypes.DOMDomain.NodeId[] } {
		return null;
	}

	discardSearchResults(params: inspectorCommandTypes.DOMDomain.DiscardSearchResultsMethodArguments): void {
		return;
	}

	highlightNode(params: inspectorCommandTypes.DOMDomain.HighlightNodeMethodArguments): void {
		return;
	}

	hideHighlight(): void {
		return;
	}

	resolveNode(params: inspectorCommandTypes.DOMDomain.ResolveNodeMethodArguments): { object: inspectorCommandTypes.RuntimeDomain.RemoteObject } {
		return null;
	}
}
