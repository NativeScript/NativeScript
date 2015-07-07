import definition = require("fps-meter/fps-native");

class FrameHandlerImpl extends NSObject {
    static new(): FrameHandlerImpl {
        return <FrameHandlerImpl>super.new();
    }

    private _owner: FPSCallback;

    public initWithOwner(owner: FPSCallback): FrameHandlerImpl {
        this._owner = owner;
        return this;
    }

    public handleFrame(sender: CADisplayLink): void {
        this._owner._handleFrame(sender);
    }

    public static ObjCExposedMethods = {
        "handleFrame": { returns: interop.types.void, params: [ CADisplayLink ] }
    };
}

export class FPSCallback implements definition.FPSCallback {
    public running: boolean;
    private onFrame: Function;
    private displayLink: CADisplayLink;
    private impl: FrameHandlerImpl;

    constructor(onFrame: (currentTimeMillis: number) => void) {
        this.onFrame = onFrame;

        this.impl = FrameHandlerImpl.new().initWithOwner(this);

        this.displayLink = CADisplayLink.displayLinkWithTargetSelector(this.impl, "handleFrame");
        this.displayLink.paused = true;
        this.displayLink.addToRunLoopForMode(NSRunLoop.currentRunLoop(), NSDefaultRunLoopMode);
        // UIScrollView (including in UIITableView) will run a loop in UITrackingRunLoopMode during scrolling.
        // If we do not add the CADisplayLink in this mode, it would appear paused during scrolling.
        this.displayLink.addToRunLoopForMode(NSRunLoop.currentRunLoop(), UITrackingRunLoopMode);
    }

    public start() {
        if (this.running) {
            return;
        }

        this.running = true;
        this.displayLink.paused = false;
    }

    public stop() {
        if (!this.running) {
            return;
        }

        this.displayLink.paused = true;
        this.running = false;
    }

    public _handleFrame(sender: CADisplayLink) {
        if (!this.running) {
            return;
        }

        // timestamp is CFTimeInterval, which is in seconds, the onFrame callback expects millis, so multiply by 1000
        this.onFrame(sender.timestamp * 1000);
    }
}