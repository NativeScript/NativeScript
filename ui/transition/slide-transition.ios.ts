import transition = require("ui/transition");
import platform = require("platform");

var screenWidth = platform.screen.mainScreen.widthDIPs;
var screenHeight = platform.screen.mainScreen.heightDIPs;
var leftEdge = CGAffineTransformMakeTranslation(-screenWidth, 0);
var rightEdge = CGAffineTransformMakeTranslation(screenWidth, 0);
var topEdge = CGAffineTransformMakeTranslation(0, -screenHeight);
var bottomEdge = CGAffineTransformMakeTranslation(0, screenHeight);

export class SlideTransition extends transition.Transition {
    private _direction: string;

    constructor(direction: string, duration: number, curve: any) {
        super(duration, curve);
        this._direction = direction;
    }

    public animateIOSTransition(containerView: UIView, fromView: UIView, toView: UIView, operation: UINavigationControllerOperation, completion: (finished: boolean) => void): void {
        var fromViewEndTransform: CGAffineTransform;
        var toViewBeginTransform: CGAffineTransform;
        var push = (operation === UINavigationControllerOperation.UINavigationControllerOperationPush);

        switch (this._direction) {
            case "left":
                toViewBeginTransform = push ? rightEdge : leftEdge;
                fromViewEndTransform = push ? leftEdge : rightEdge;
                break;
            case "right":
                toViewBeginTransform = push ? leftEdge : rightEdge;
                fromViewEndTransform = push ? rightEdge : leftEdge;
                break;
            case "top":
                toViewBeginTransform = push ? bottomEdge : topEdge;
                fromViewEndTransform = push ? topEdge : bottomEdge;
                break;
            case "bottom":
                toViewBeginTransform = push ? topEdge : bottomEdge;
                fromViewEndTransform = push ? bottomEdge : topEdge;
                break;
        }

        toView.transform = toViewBeginTransform;
        fromView.transform = CGAffineTransformIdentity;

        switch (operation) {
            case UINavigationControllerOperation.UINavigationControllerOperationPush:
                containerView.insertSubviewAboveSubview(toView, fromView);
                break;
            case UINavigationControllerOperation.UINavigationControllerOperationPop:
                containerView.insertSubviewBelowSubview(toView, fromView);
                break;
        }

        var duration = this.getDuration();
        var curve = this.getCurve();
        UIView.animateWithDurationAnimationsCompletion(duration, () => {
            UIView.setAnimationCurve(curve);
            toView.transform = CGAffineTransformIdentity;
            fromView.transform = fromViewEndTransform;
        }, completion);
    }
}