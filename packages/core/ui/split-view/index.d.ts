import { SplitViewBase } from './split-view-common';

// Note: Using 'inspector' splitRole does not (yet) require a distinct style; it's an optional trailing column.
export type SplitStyle = 'automatic' | 'double' | 'triple';

export type SplitRole = 'primary' | 'secondary' | 'supplementary' | 'inspector';
export type SplitDisplayMode = 'automatic' | 'secondaryOnly' | 'oneBesideSecondary' | 'oneOverSecondary' | 'twoBesideSecondary' | 'twoOverSecondary' | 'twoDisplaceSecondary';
export type SplitBehavior = 'automatic' | 'tile' | 'overlay' | 'displace';

/**
 * iOS UISplitViewController-backed container.
 * On Android, acts as a simple container.
 *
 * @nsView SplitView
 */
export class SplitView extends SplitViewBase {}
