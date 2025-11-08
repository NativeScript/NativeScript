import { SplitViewBase } from './split-view-common';

export type { SplitBehavior, SplitRole, SplitStyle, SplitDisplayMode } from './split-view-common';

/**
 * iOS UISplitViewController-backed container.
 * On Android, acts as a simple container.
 *
 * @nsView SplitView
 */
export class SplitView extends SplitViewBase {}
