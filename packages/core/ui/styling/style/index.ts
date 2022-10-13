import { Style as StyleDefinition } from '.';
import { Color } from '../../../color';
import { Font, FontStyleType, FontWeightType } from '../font';
import { Background } from '../background';
import { ViewBase } from '../../core/view-base';
import { LinearGradient } from '../../styling/linear-gradient';
import { Observable } from '../../../data/observable';

import { FlexDirection, FlexWrap, JustifyContent, AlignItems, AlignContent, Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf } from '../../layouts/flexbox-layout';
import { Trace } from '../../../trace';
import { CoreTypes } from '../../../core-types';
import { AccessibilityLiveRegion, AccessibilityRole, AccessibilityState } from '../../../accessibility/accessibility-types';
import { CSSShadow } from '../css-shadow';

export interface CommonLayoutParams {
	width: number;
	height: number;

	widthPercent: number;
	heightPercent: number;

	leftMargin: number;
	topMargin: number;
	rightMargin: number;
	bottomMargin: number;

	leftMarginPercent: number;
	topMarginPercent: number;
	rightMarginPercent: number;
	bottomMarginPercent: number;

	horizontalAlignment: CoreTypes.HorizontalAlignmentType;
	verticalAlignment: CoreTypes.VerticalAlignmentType;
}

export class Style extends Observable implements StyleDefinition {
	private unscopedCssVariables = new Map<string, string>();
	private scopedCssVariables = new Map<string, string>();

	constructor(ownerView: ViewBase | WeakRef<ViewBase>) {
		super();

		// HACK: Could not find better way for cross platform WeakRef type checking.
		if (ownerView.constructor.toString().indexOf('[native code]') !== -1) {
			this.viewRef = <WeakRef<ViewBase>>ownerView;
		} else {
			this.viewRef = new WeakRef(<ViewBase>ownerView);
		}
	}

	public setScopedCssVariable(varName: string, value: string): void {
		this.scopedCssVariables.set(varName, value);
	}

	public setUnscopedCssVariable(varName: string, value: string): void {
		this.unscopedCssVariables.set(varName, value);
	}

	public removeScopedCssVariable(varName: string): void {
		this.scopedCssVariables.delete(varName);
	}

	public removeUnscopedCssVariable(varName: string): void {
		this.unscopedCssVariables.delete(varName);
	}

	public getCssVariable(varName: string): string | null {
		const view = this.view;
		if (!view) {
			return null;
		}

		if (this.unscopedCssVariables.has(varName)) {
			return this.unscopedCssVariables.get(varName);
		}

		if (this.scopedCssVariables.has(varName)) {
			return this.scopedCssVariables.get(varName);
		}

		if (!view.parent || !view.parent.style) {
			return null;
		}

		return view.parent.style.getCssVariable(varName);
	}

	public resetScopedCssVariables() {
		this.scopedCssVariables.clear();
	}

	public resetUnscopedCssVariables() {
		this.unscopedCssVariables.clear();
	}

	toString() {
		const view = this.viewRef.deref();
		if (!view) {
			Trace.write(`toString() of Style cannot execute correctly because ".viewRef" is cleared`, Trace.categories.Animation, Trace.messageType.warn);

			return '';
		}

		return `${view}.style`;
	}

	public fontInternal: Font;
	public _fontScale: number;
	public backgroundInternal: Background;

	public rotate: number;
	public rotateX: number;
	public rotateY: number;
	public perspective: number;

	public scaleX: number;
	public scaleY: number;
	public translateX: CoreTypes.dip;
	public translateY: CoreTypes.dip;

	public clipPath: string;
	public color: Color;
	public tintColor: Color;
	public placeholderColor: Color;

	public background: string;
	public backgroundColor: Color;
	public backgroundImage: string | LinearGradient;
	public backgroundRepeat: CoreTypes.BackgroundRepeatType;
	public backgroundSize: string;
	public backgroundPosition: string;

	public borderColor: string | Color;
	public borderTopColor: Color;
	public borderRightColor: Color;
	public borderBottomColor: Color;
	public borderLeftColor: Color;
	public borderWidth: string | CoreTypes.LengthType;
	public borderTopWidth: CoreTypes.LengthType;
	public borderRightWidth: CoreTypes.LengthType;
	public borderBottomWidth: CoreTypes.LengthType;
	public borderLeftWidth: CoreTypes.LengthType;
	public borderRadius: string | CoreTypes.LengthType;
	public borderTopLeftRadius: CoreTypes.LengthType;
	public borderTopRightRadius: CoreTypes.LengthType;
	public borderBottomRightRadius: CoreTypes.LengthType;
	public borderBottomLeftRadius: CoreTypes.LengthType;

	public boxShadow: CSSShadow;

	public fontSize: number;
	public fontFamily: string;
	public fontStyle: FontStyleType;
	public fontWeight: FontWeightType;
	public font: string;

	public maxLines: CoreTypes.MaxLinesType;

	public androidElevation: number;
	public androidDynamicElevationOffset: number;
	public zIndex: number;
	public opacity: number;
	public visibility: CoreTypes.VisibilityType;

	public letterSpacing: number;
	public lineHeight: number;
	public textAlignment: CoreTypes.TextAlignmentType;
	public textDecoration: CoreTypes.TextDecorationType;
	public textTransform: CoreTypes.TextTransformType;
	public textShadow: CSSShadow;
	public whiteSpace: CoreTypes.WhiteSpaceType;

	public minWidth: CoreTypes.LengthType;
	public minHeight: CoreTypes.LengthType;
	public width: CoreTypes.PercentLengthType;
	public height: CoreTypes.PercentLengthType;
	public margin: string | CoreTypes.PercentLengthType;
	public marginLeft: CoreTypes.PercentLengthType;
	public marginTop: CoreTypes.PercentLengthType;
	public marginRight: CoreTypes.PercentLengthType;
	public marginBottom: CoreTypes.PercentLengthType;
	public padding: string | CoreTypes.LengthType;
	public paddingLeft: CoreTypes.LengthType;
	public paddingTop: CoreTypes.LengthType;
	public paddingRight: CoreTypes.LengthType;
	public paddingBottom: CoreTypes.LengthType;
	public horizontalAlignment: CoreTypes.HorizontalAlignmentType;
	public verticalAlignment: CoreTypes.VerticalAlignmentType;

	// TabView-specific props
	public tabTextFontSize: number;
	public tabTextColor: Color;
	public tabBackgroundColor: Color;
	public selectedTabTextColor: Color;
	public androidSelectedTabHighlightColor: Color;

	// ListView-specific props
	public separatorColor: Color;

	//SegmentedBar-specific props
	public selectedBackgroundColor: Color;

	// Page-specific props
	public statusBarStyle: 'light' | 'dark';
	public androidStatusBarBackground: Color;

	// ActionBar-specific props
	public androidContentInset: string | CoreTypes.LengthType;
	public androidContentInsetLeft: CoreTypes.LengthType;
	public androidContentInsetRight: CoreTypes.LengthType;

	//flexbox layout properties
	public flexDirection: FlexDirection;
	public flexWrap: FlexWrap;
	public justifyContent: JustifyContent;
	public alignItems: AlignItems;
	public alignContent: AlignContent;
	public order: Order;
	public flexGrow: FlexGrow;
	public flexShrink: FlexShrink;
	public flexWrapBefore: FlexWrapBefore;
	public alignSelf: AlignSelf;

	// Accessibility properties
	public accessible: boolean;
	public accessibilityHidden: boolean;
	public accessibilityRole: AccessibilityRole;
	public accessibilityState: AccessibilityState;
	public accessibilityLiveRegion: AccessibilityLiveRegion;
	public accessibilityLanguage: string;
	public accessibilityMediaSession: boolean;
	public accessibilityStep: number;

	public PropertyBag: {
		new (): { [property: string]: string };
		prototype: { [property: string]: string };
	};

	public viewRef: WeakRef<ViewBase>;

	public get view(): ViewBase {
		if (this.viewRef) {
			return this.viewRef.deref();
		}

		return undefined;
	}
}
Style.prototype.PropertyBag = class {
	[property: string]: string;
};
