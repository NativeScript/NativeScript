import { Transition, AndroidTransitionType } from "./transition";

// http://developer.android.com/training/animation/cardflip.html
export class FlipTransition extends Transition {
    private _direction: string;

    constructor(direction: string, duration: number, curve: any) {
        super(duration, curve);
        this._direction = direction;
    }

    public createAndroidAnimation(transitionType: string): android.view.animation.Animation {
        ensureRotate3dAnimationClass();

        let animation: android.view.animation.Animation;
        let animationSet: android.view.animation.AnimationSet
        let rotateAnimation: android.view.animation.Animation;
        let alphaAnimation: android.view.animation.Animation;
        const fullDuration = this.getDuration() || 300;
        const interpolator = this.getCurve();
        const rotationY = this._direction === "right" ? 180 : -180;

        switch (transitionType) {
            case AndroidTransitionType.enter: // card_flip_right_in
                animation = new Rotate3dAnimationClass(rotationY, 0.0, 0.5, 0.5);
                animation.setInterpolator(interpolator);
                animation.setDuration(fullDuration);
                break;
            case AndroidTransitionType.exit: // card_flip_right_out
                animation = animationSet = new android.view.animation.AnimationSet(false /* shareInterpolator */);
                
                rotateAnimation = new Rotate3dAnimationClass(0.0, -rotationY, 0.5, 0.5);
                rotateAnimation.setInterpolator(interpolator);
                rotateAnimation.setDuration(fullDuration);
                animationSet.addAnimation(rotateAnimation);

                alphaAnimation = new android.view.animation.AlphaAnimation(1.0, 0.0);
                alphaAnimation.setStartOffset(fullDuration / 2);
                alphaAnimation.setDuration(1);
                animationSet.addAnimation(alphaAnimation);
                break;
            case AndroidTransitionType.popEnter: // card_flip_left_in
                animation = new Rotate3dAnimationClass(-rotationY, 0.0, 0.5, 0.5);
                animation.setInterpolator(interpolator);
                animation.setDuration(fullDuration);
                break;
            case AndroidTransitionType.popExit: // card_flip_left_out
                animation = animationSet = new android.view.animation.AnimationSet(false /* shareInterpolator */);
                
                rotateAnimation = new Rotate3dAnimationClass(0.0, rotationY, 0.5, 0.5);
                rotateAnimation.setInterpolator(interpolator);
                rotateAnimation.setDuration(fullDuration);
                animationSet.addAnimation(rotateAnimation);

                alphaAnimation = new android.view.animation.AlphaAnimation(1.0, 0.0);
                alphaAnimation.setStartOffset(fullDuration / 2);
                alphaAnimation.setDuration(1);
                animationSet.addAnimation(alphaAnimation);
                break;
        }

        return animation;
    }
}

let Rotate3dAnimationClass;
function ensureRotate3dAnimationClass() {
    if (Rotate3dAnimationClass) {
        return;
    }

    /**
     * Creates a new 3D rotation on the Y axis. The rotation is defined by its
     * start angle and its end angle. Both angles are in degrees. The rotation
     * is performed around a center point on the 2D space, definied by a pair
     * of X and Y coordinates, called centerX and centerY.
     *
     * @param fromDegrees the start angle of the 3D rotation
     * @param toDegrees the end angle of the 3D rotation
     * @param centerX the X center of the 3D rotation (relative to self)
     * @param centerY the Y center of the 3D rotation (relative to self)
     */
    class Rotate3dAnimation extends android.view.animation.Animation {
        private _camera: android.graphics.Camera;
        private _pivotX: number;
        private _pivotY: number;

        constructor(
            private _fromDegrees: number,
            private _toDegrees: number,
            private _centerX: number,
            private _centerY: number) {
            super();
            return global.__native(this);
        }

        public initialize(width: number, height: number, parentWidth: number, parentHeight: number) {
            super.initialize(width, height, parentWidth, parentHeight);
            this._pivotX = this.resolveSize(android.view.animation.Animation.RELATIVE_TO_SELF, this._centerX, width, parentWidth);
            this._pivotY = this.resolveSize(android.view.animation.Animation.RELATIVE_TO_SELF, this._centerY, height, parentHeight);
            this._camera = new android.graphics.Camera();
        }

        public applyTransformation(interpolatedTime: number, t: android.view.animation.Transformation) {
            const fromDegrees = this._fromDegrees;
            const degrees = fromDegrees + ((this._toDegrees - fromDegrees) * interpolatedTime);

            const pivotX = this._pivotX;
            const pivotY = this._pivotY;
            const camera = this._camera;

            const matrix: android.graphics.Matrix = t.getMatrix();

            camera.save();
            camera.rotateY(degrees);
            camera.getMatrix(matrix);
            camera.restore();

            matrix.preTranslate(-pivotX, -pivotY);
            matrix.postTranslate(pivotX, pivotY);
        }
    }

    Rotate3dAnimationClass = Rotate3dAnimation;
}