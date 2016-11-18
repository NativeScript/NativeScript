import { ControlStateChangeListener } from "ui/core/control-state-change";
import { whiteSpaceProperty, borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty, paddingProperty } from "ui/styling/style";

import { View, PseudoClassHandler } from "ui/core/view";
import types = require("utils/types");

import { ButtonBase } from "./button-common";
import { textProperty, formattedTextProperty } from "../text-base/text-base-common";
import { WhiteSpace } from "ui/enums";

export * from "./button-common";

export class Button extends ButtonBase {
    public nativeView: UIButton;
    private _tapHandler: NSObject;
    private _stateChangedHandler: ControlStateChangeListener;

    constructor() {
        super();
        this.nativeView = UIButton.buttonWithType(UIButtonType.System);

        this._tapHandler = TapHandlerImpl.initWithOwner(new WeakRef(this));
        this.nativeView.addTargetActionForControlEvents(this._tapHandler, "tap", UIControlEvents.TouchUpInside);
    }

    public onUnloaded() {
        super.onUnloaded();
        if (this._stateChangedHandler) {
            this._stateChangedHandler.stop();
        }
    }

    @PseudoClassHandler("normal", "highlighted", "pressed", "active")
    _updateHandler(subscribe: boolean) {
        if (subscribe) {
            if (!this._stateChangedHandler) {
                this._stateChangedHandler = new ControlStateChangeListener(this.nativeView, (s: string) => {
                    this._goToVisualState(s);
                });
            }
            this._stateChangedHandler.start();
        } else {
            this._stateChangedHandler.stop();
        }
    }

    get [whiteSpaceProperty.native](): string {
        return WhiteSpace.normal;
    }
    set [whiteSpaceProperty.native](value: string) {
        let nativeView = this.nativeView.titleLabel;
        if (value === WhiteSpace.normal) {
            nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
            nativeView.numberOfLines = 0;
        }
        else {
            nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
            nativeView.numberOfLines = 1;
        }
    }

    get [borderTopWidthProperty.native](): number {
        return 0;
    }
    set [borderTopWidthProperty.native](value: number) {
        let nativeView = this.nativeView;
        let insets = nativeView.contentEdgeInsets;
        insets.top = this.style.paddingTop + value;
        nativeView.contentEdgeInsets = insets;
    }

    get [borderRightWidthProperty.native](): number {
        return 0;
    }
    set [borderRightWidthProperty.native](value: number) {
        let nativeView = this.nativeView;
        let insets = nativeView.contentEdgeInsets;
        insets.right = this.style.paddingRight + value;
        nativeView.contentEdgeInsets = insets;
    }

    get [borderBottomWidthProperty.native](): number {
        return 0;
    }
    set [borderBottomWidthProperty.native](value: number) {
        let nativeView = this.nativeView;
        let insets = nativeView.contentEdgeInsets;
        insets.bottom = this.style.paddingBottom + value;
        nativeView.contentEdgeInsets = insets;
    }

    get [borderLeftWidthProperty.native](): number {
        return 0;
    }
    set [borderLeftWidthProperty.native](value: number) {
        let nativeView = this.nativeView;
        let insets = nativeView.contentEdgeInsets;
        insets.left = this.style.paddingLeft + value;
        nativeView.contentEdgeInsets = insets;
    }

    get [paddingProperty.native](): UIEdgeInsets {
        return this.nativeView.contentEdgeInsets;
    }
    set [paddingProperty.native](value: UIEdgeInsets) {
        let nativeView = this.nativeView;
        let style = this.style;
        var top = value.top + style.borderTopWidth;
        var left = value.left + style.borderLeftWidth;
        var bottom = value.bottom + style.borderBottomWidth;
        var right = value.right + style.borderRightWidth;
        this.nativeView.contentEdgeInsets = { left, top, right, bottom };
    }
}

class TapHandlerImpl extends NSObject {
    private _owner: WeakRef<Button>;

    public static initWithOwner(owner: WeakRef<Button>): TapHandlerImpl {
        let handler = <TapHandlerImpl>TapHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public tap(args) {
        let owner = this._owner.get();
        if (owner) {
            owner._emit(ButtonBase.tapEvent);
        }
    }

    public static ObjCExposedMethods = {
        "tap": { returns: interop.types.void, params: [interop.types.id] }
    };
}