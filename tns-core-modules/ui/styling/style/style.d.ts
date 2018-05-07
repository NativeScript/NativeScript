/**
 * @module "ui/styling/style"
 */ /** */

import { Length, PercentLength, ViewBase, Observable, BackgroundRepeat, Visibility, HorizontalAlignment, VerticalAlignment, dip } from "../../core/view";
import { Color } from "../../../color";
import { Background } from "../background";
import { Font, FontStyle, FontWeight } from "../font";
import { TextAlignment, TextDecoration, TextTransform, WhiteSpace } from "../../text-base";
import {
    FlexDirection, FlexWrap, JustifyContent, AlignItems, AlignContent,
    Order, FlexGrow, FlexShrink, FlexWrapBefore, AlignSelf
} from "../../layouts/flexbox-layout";

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
    public translateX: dip;
    public translateY: dip;

    public clipPath: string;
    public color: Color;
    public tintColor: Color;
    public placeholderColor: Color;

    public background: string;
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

    constructor(ownerView: ViewBase);
    public view: ViewBase;

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

    /**
     * The property bag is a simple class that is paired with the Style class.
     * Setting regular css properties on the PropertyBag should simply preserve their values.
     * Setting shorthand css properties on the PropertyBag should decompose the provided value, and set each of the shorthand composite properties.
     * The shorthand properties are defined as non-enumerable so it should be safe to for-in the keys that are set in the bag.
     */
    public readonly PropertyBag: PropertyBagClass;
}

interface PropertyBagClass {
    new(): PropertyBag;
    prototype: PropertyBag;
}
interface PropertyBag {
    [property: string]: string;
}