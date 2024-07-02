import type { View } from '../../ui/core/view';

/**
 * Whether the app is embedded into a host project or standalone project
 */
export function isEmbedded(): boolean;

export function setEmbeddedView(view: View | undefined): void;

export function getEmbeddedView(): View;
