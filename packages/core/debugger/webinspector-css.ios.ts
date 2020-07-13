import * as inspectorCommandTypes from './InspectorBackendCommands.ios';
const inspectorCommands: typeof inspectorCommandTypes = require('./InspectorBackendCommands');

import * as debuggerDomains from '.';

import { attachCSSInspectorCommandCallbacks } from './devtools-elements';

@inspectorCommands.DomainDispatcher('CSS')
export class CSSDomainDebugger implements inspectorCommandTypes.CSSDomain.CSSDomainDispatcher {
	private _enabled: boolean;
	public events: inspectorCommandTypes.CSSDomain.CSSFrontend;
	public commands: any;

	constructor() {
		this.events = new inspectorCommands.CSSDomain.CSSFrontend();

		this.commands = {};

		attachCSSInspectorCommandCallbacks(this.commands);

		// By default start enabled because we can miss the "enable" event when
		// running with `--debug-brk` -- the frontend will send it before we've been created
		this.enable();
	}

	get enabled(): boolean {
		return this._enabled;
	}

	enable(): void {
		if (debuggerDomains.getCSS()) {
			throw new Error('One CSSDomainDebugger may be enabled at a time.');
		} else {
			debuggerDomains.setCSS(this);
		}
		this._enabled = true;
	}

	/**
	 * Disables network tracking, prevents network events from being sent to the client.
	 */
	disable(): void {
		if (debuggerDomains.getCSS() === this) {
			debuggerDomains.setCSS(null);
		}
		this._enabled = false;
	}

	getMatchedStylesForNode(
		params: inspectorCommandTypes.CSSDomain.GetMatchedStylesForNodeMethodArguments
	): {
		inlineStyle?: inspectorCommandTypes.CSSDomain.CSSStyle;
		attributesStyle?: inspectorCommandTypes.CSSDomain.CSSStyle;
		matchedCSSRules?: inspectorCommandTypes.CSSDomain.RuleMatch[];
		pseudoElements?: inspectorCommandTypes.CSSDomain.PseudoElementMatches[];
		inherited?: inspectorCommandTypes.CSSDomain.InheritedStyleEntry[];
		cssKeyframesRules?: inspectorCommandTypes.CSSDomain.CSSKeyframesRule[];
	} {
		return {};
	}
	// Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM attributes) for a DOM node identified by <code>nodeId</code>.
	getInlineStylesForNode(
		params: inspectorCommandTypes.CSSDomain.GetInlineStylesForNodeMethodArguments
	): {
		inlineStyle?: inspectorCommandTypes.CSSDomain.CSSStyle;
		attributesStyle?: inspectorCommandTypes.CSSDomain.CSSStyle;
	} {
		return {};
	}
	// Returns the computed style for a DOM node identified by <code>nodeId</code>.
	getComputedStyleForNode(
		params: inspectorCommandTypes.CSSDomain.GetComputedStyleForNodeMethodArguments
	): {
		computedStyle: inspectorCommandTypes.CSSDomain.CSSComputedStyleProperty[];
	} {
		return {
			computedStyle: this.commands.getComputedStylesForNode(params.nodeId),
		};
	}
	// Requests information about platform fonts which we used to render child TextNodes in the given node.
	getPlatformFontsForNode(params: inspectorCommandTypes.CSSDomain.GetPlatformFontsForNodeMethodArguments): { fonts: inspectorCommandTypes.CSSDomain.PlatformFontUsage[] } {
		return {
			fonts: [
				{
					// Font's family name reported by platform.
					familyName: 'Standard Font',
					// Indicates if the font was downloaded or resolved locally.
					isCustomFont: false,
					// Amount of glyphs that were rendered with this font.
					glyphCount: 0,
				},
			],
		};
	}
	// Returns the current textual content and the URL for a stylesheet.
	getStyleSheetText(params: inspectorCommandTypes.CSSDomain.GetStyleSheetTextMethodArguments): { text: string } {
		return null;
	}
}
