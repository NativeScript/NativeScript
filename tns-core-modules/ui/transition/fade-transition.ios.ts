import transition = require("ui/transition");

export class FadeTransition extends transition.Transition {
    public animateIOSTransition(containerView: UIView, fromView: UIView, toView: UIView, operation: UINavigationControllerOperation, completion: (finished: boolean) => void): void {
        let originalToViewAlpha = toView.alpha; 
        let originalFromViewAlpha = fromView.alpha; 
        
        toView.alpha = 0.0;
        fromView.alpha = 1.0;

        switch (operation) {
            case UINavigationControllerOperation.UINavigationControllerOperationPush:
                containerView.insertSubviewAboveSubview(toView, fromView);
                break;
            case UINavigationControllerOperation.UINavigationControllerOperationPop:
                containerView.insertSubviewBelowSubview(toView, fromView);
                break;
        }

        let duration = this.getDuration();
        let curve = this.getCurve();
        UIView.animateWithDurationAnimationsCompletion(duration, () => {
            UIView.setAnimationCurve(curve);
            toView.alpha = 1.0;
            fromView.alpha = 0.0;
        }, (finished: boolean) => {
            toView.alpha = originalToViewAlpha; 
            fromView.alpha = originalFromViewAlpha; 
            completion(finished);   
        });
    }
}