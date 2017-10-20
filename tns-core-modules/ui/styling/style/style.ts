import { Style as StyleDefinition } from ".";
import { Color } from "../../../color";
import { Font, FontStyle, FontWeight } from "../font";
import { Background } from "../background";
import { Length, PercentLength, ViewBase, BackgroundRepeat, Visibility, HorizontalAlignment, VerticalAlignment, dip } from "../../core/view";
import { Observable } from "../../../data/observable";

import {
    FlexDirection, FlexWrap, JustifyContent, AlignItems, AlignContent,
    Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf
} from "../../layouts/flexbox-layout";

import { TextAlignment, TextDecoration, TextTransform, WhiteSpace } from "../../text-base";

export class Style extends Observable implements StyleDefinition {
    constructor(public view: ViewBase) {
        super();
    }

    toString() {
        return `${this.view}.style`;
    }

    public fontInternal: Font;
    public backgroundInternal: Background;

    public rotate: number;
    public scaleX: number;
    public scaleY: number;
    public translateX: dip;
    public translateY: dip;

    public clipPath: string;
    public color: Color;
    public tintColor: Color;
    public placeholderColor: Color;

    public background: string | Color;
    public backgroundColor: Color;
    public backgroundImage: string;
    public backgroundRepeat: BackgroundRepeat;
    public backgroundSize: string;
    public backgroundPosition: string;

    public borderColor: string | Color;
    public borderTopColor: Color;
    public borderRightColor: Color;
    public borderBottomColor: Color;
    public borderLeftColor: Color;
    public borderWidth: string | Length;
    public borderTopWidth: Length;
    public borderRightWidth: Length;
    public borderBottomWidth: Length;
    public borderLeftWidth: Length;
    public borderRadius: string | Length;
    public borderTopLeftRadius: Length;
    public borderTopRightRadius: Length;
    public borderBottomRightRadius: Length;
    public borderBottomLeftRadius: Length;

    public fontSize: number;
    public fontFamily: string;
    public fontStyle: FontStyle;
    public fontWeight: FontWeight;
    public font: string;

    public zIndex: number;
    public opacity: number;
    public visibility: Visibility;

    public letterSpacing: number;
    public lineHeight: number;
    public textAlignment: TextAlignment;
    public textDecoration: TextDecoration;
    public textTransform: TextTransform;
    public whiteSpace: WhiteSpace;

    public minWidth: Length;
    public minHeight: Length;
    public width: PercentLength;
    public height: PercentLength;
    public margin: string | PercentLength;
    public marginLeft: PercentLength;
    public marginTop: PercentLength;
    public marginRight: PercentLength;
    public marginBottom: PercentLength;
    public padding: string | Length;
    public paddingLeft: Length;
    public paddingTop: Length;
    public paddingRight: Length;
    public paddingBottom: Length;
    public horizontalAlignment: HorizontalAlignment;
    public verticalAlignment: VerticalAlignment;

    // TabView-specific props
    public tabTextColor: Color;
    public tabBackgroundColor: Color;
    public selectedTabTextColor: Color;
    public androidSelectedTabHighlightColor: Color;

    // ListView-specific props 
    public separatorColor: Color;

    //SegmentedBar-specific props
    public selectedBackgroundColor: Color;

    // Page-specific props 
    public statusBarStyle: "light" | "dark";
    public androidStatusBarBackground: Color;

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

    public PropertyBag: { new(): { [property: string]: string }, prototype: { [property: string]: string } };
}
Style.prototype.PropertyBag = class { [property: string]: string; }