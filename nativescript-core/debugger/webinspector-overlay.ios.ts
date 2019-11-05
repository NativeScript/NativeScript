import * as inspectorCommandTypes from "./InspectorBackendCommands.ios";
const inspectorCommands: typeof inspectorCommandTypes = require("./InspectorBackendCommands");

import * as debuggerDomains from "./debugger";

import { attachDOMInspectorCommandCallbacks, InspectorCommands } from "./devtools-elements";

@inspectorCommands.DomainDispatcher("Overlay")
export class OverlayDomainDebugger {

    private _enabled: boolean;
    public commands: InspectorCommands;

    constructor() {

        this.commands = (<any>{});

        attachDOMInspectorCommandCallbacks(this.commands);

        // By default start enabled because we can miss the "enable event when
        // running with `--debug-brk` -- the frontend will send it before we've been created
        this.enable();
    }

    get enabled(): boolean {
        return this._enabled;
    }

    enable(): void {
        if (debuggerDomains.getOverlay()) {
            throw new Error("One OverlayDebugger may be enabled at a time.");
        } else {
            debuggerDomains.setOverlay(this);
        }
        this._enabled = true;
    }

    disable(): void {
        if (debuggerDomains.getOverlay() === this) {
            debuggerDomains.setOverlay(null);
        }
        this._enabled = false;
    }

    highlightNode(params: any): void {
        // console.log("---> highlightNode", params.nodeId);
        // console.dir(params);
        this.commands.highlightNode(params.nodeId);
    }

    hideHighlight(): void {
        // console.log("---> hideHighlight");
        this.commands.hideHighlight();
    }

    setInspectMode(params: any): void {
        // console.log("---> setInspectMode", params.mode)
        // console.dir(params);
        this.commands.setInspectMode(params.mode);
    }
}