import { ControlStateChangeListener } from "../core/control-state-change";
import {
    ButtonBase, PseudoClassHandler, whiteSpaceProperty,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty, textAlignmentProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, Length, WhiteSpace, TextAlignment, layout
} from "./button-common";

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

    get ios() {
        return this.nativeView;
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

    [whiteSpaceProperty.getDefault](): WhiteSpace {
        return WhiteSpace.NO_WRAP;
    }
    [whiteSpaceProperty.setNative](value: WhiteSpace) {
        const nativeView = this.nativeView.titleLabel;
        switch (value) {
            case WhiteSpace.NORMAL:
                nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
                nativeView.numberOfLines = 0;
                break;
            case WhiteSpace.NO_WRAP:
                nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingMiddle;
                nativeView.numberOfLines = 1;
                break;
            default:
                throw new Error(`Invalid whitespace value: ${value}. Valid values are: "${WhiteSpace.NORMAL}", "${WhiteSpace.NO_WRAP}".`);
        }
    }

    [borderTopWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.top,
            unit: "px"
        };
    }
    [borderTopWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeView.contentEdgeInsets = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    [borderRightWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.right,
            unit: "px"
        };
    }
    [borderRightWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeView.contentEdgeInsets = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    [borderBottomWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.bottom,
            unit: "px"
        };
    }
    [borderBottomWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeView.contentEdgeInsets = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }

    [borderLeftWidthProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.left,
            unit: "px"
        };
    }
    [borderLeftWidthProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeView.contentEdgeInsets = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }

    [paddingTopProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.top,
            unit: "px"
        };
    }
    [paddingTopProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let top = layout.toDeviceIndependentPixels(this.effectivePaddingTop + this.effectiveBorderTopWidth);
        this.nativeView.contentEdgeInsets = { top: top, left: inset.left, bottom: inset.bottom, right: inset.right };
    }

    [paddingRightProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.right,
            unit: "px"
        };
    }
    [paddingRightProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let right = layout.toDeviceIndependentPixels(this.effectivePaddingRight + this.effectiveBorderRightWidth);
        this.nativeView.contentEdgeInsets = { top: inset.top, left: inset.left, bottom: inset.bottom, right: right };
    }

    [paddingBottomProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.bottom,
            unit: "px"
        };
    }
    [paddingBottomProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let bottom = layout.toDeviceIndependentPixels(this.effectivePaddingBottom + this.effectiveBorderBottomWidth);
        this.nativeView.contentEdgeInsets = { top: inset.top, left: inset.left, bottom: bottom, right: inset.right };
    }

    [paddingLeftProperty.getDefault](): Length {
        return {
            value: this.nativeView.contentEdgeInsets.left,
            unit: "px"
        };
    }
    [paddingLeftProperty.setNative](value: Length) {
        let inset = this.nativeView.contentEdgeInsets;
        let left = layout.toDeviceIndependentPixels(this.effectivePaddingLeft + this.effectiveBorderLeftWidth);
        this.nativeView.contentEdgeInsets = { top: inset.top, left: left, bottom: inset.bottom, right: inset.right };
    }

    [textAlignmentProperty.getDefault](): TextAlignment {
        return Button.nativeToJsTextAlignment[this.nativeView.contentHorizontalAlignment];
    }
    [textAlignmentProperty.setNative](value: TextAlignment) {
        this.nativeView.contentHorizontalAlignment = Button.jsToNativeTextAlignment[value];
    }

    private static nativeToJsTextAlignment: { [key: number]: TextAlignment } = {
        [UIControlContentHorizontalAlignment.Left]: "left",
        [UIControlContentHorizontalAlignment.Center]: "center",
        [UIControlContentHorizontalAlignment.Right]: "right",
        [UIControlContentHorizontalAlignment.Fill]: "center"
    }
    private static jsToNativeTextAlignment: { [key in TextAlignment]: UIControlContentHorizontalAlignment } = {
        "left": UIControlContentHorizontalAlignment.Left,
        "center": UIControlContentHorizontalAlignment.Center,
        "right": UIControlContentHorizontalAlignment.Right
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
