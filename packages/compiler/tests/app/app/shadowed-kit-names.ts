import { PageTransition, Transition } from '@nativescript/core';

// A class named like core's: the app's own where the app names it, beside the kit's.
@NativeClass()
class PageTransitionController extends NSObject implements UIViewControllerAnimatedTransitioning {
  static ObjCProtocols = [UIViewControllerAnimatedTransitioning];
  owner!: WeakRef<PageTransition>;

  static initWithOwner(owner: WeakRef<PageTransition>) {
    const ctrl = <PageTransitionController>PageTransitionController.new();
    ctrl.owner = owner;
    return ctrl;
  }

  transitionDuration(transitionContext: UIViewControllerContextTransitioning): number {
    return 0.3;
  }

  animateTransition(transitionContext: UIViewControllerContextTransitioning): void {
    transitionContext.completeTransition(true);
  }
}

// Fields core's PageTransition declares, redeclared: one of the app's class above, the others of the kit's types.
export class ShadowingTransition extends PageTransition {
  transitionController!: PageTransitionController;
  presented!: UIViewController;
  operation!: number;

  iosNavigatedController(navigationController: UINavigationController, operation: number, fromVC: UIViewController, toVC: UIViewController): UIViewControllerAnimatedTransitioning {
    this.presented = toVC;
    this.transitionController = PageTransitionController.initWithOwner(new WeakRef(this));
    this.operation = operation;
    return this.transitionController;
  }
}

export class SlowTransition extends Transition {
  constructor(duration?: number, curve?: any) {
    super(duration, curve);
  }
}
