import { Length, PercentLength, ViewBase, Observable, BackgroundRepeat, Visibility, HorizontalAlignment, VerticalAlignment} from "ui/core/view";
import { Color } from "color";
import { Background } from "ui/styling/background";
import { Font, FontStyle, FontWeight } from "ui/styling/font";
import { TextAlignment, TextDecoration, TextTransform, WhiteSpace } from "ui/text-base";
import {
    FlexDirection, FlexWrap, JustifyContent, AlignItems, AlignContent,
    Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf
} from "ui/layouts/flexbox-layout"

export interface Thickness {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export interface BorderColor {
    top: Color;
    right: Color;
    bottom: Color;
    left: Color;
}

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

    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
}

export class Style extends Observable {

    public fontInternal: Font;
    public backgroundInternal: Background;

    public rotate: number;
    public scaleX: number;
    public scaleY: number;
    public translateX: Length;
    public translateY: Length;

    public clipPath: string;
    public color: Color;
    public tintColor: Color;
    public placeholderColor: Color;

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
    public statusBarStyle: string;
    public androidStatusBarBackground: Color;

    constructor(ownerView: ViewBase);
    public view: ViewBase;

    //flexbox layout properties
    flexDirection: FlexDirection;
    flexWrap: FlexWrap;
    justifyContent: JustifyContent;
    alignItems: AlignItems;
    alignContent: AlignContent;
    order: Order;
    flexGrow: FlexGrow;
    flexShrink: FlexShrink;
    flexWrapBefore: FlexWrapBefore;
    alignSelf: AlignSelf;
}
