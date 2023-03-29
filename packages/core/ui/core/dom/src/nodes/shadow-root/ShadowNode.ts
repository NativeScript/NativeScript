/**
 * Indicates that this node is part of the shadow tree.
 */
export const SHADOW_NODE = '__shadowNode';
/**
 * Indicates that the slottable was added to slot
 * at a later point after it was first attached to DOM,
 * this happens when slottable exists and slot get's added
 * later on. If slot is already present in DOM,
 * and the slottable get's added to the tree, it becomes
 * slotted automatically.
 */
export const BIND_SLOTTABLE = '__bindSlottable';
/**
 * Indicates that the node should not be removed from
 * light dom when we remove it from the rendered DOM tree.
 */
export const RETAIN_MARKER = '__retainLightRef';
/**
 * The ref that holds information of a shadow node's light dom reference.
 */
export const LIGHT_DOM_REF = '__lightRef';
/**
 * Ref of slot's fallback children
 */
export const FALLBACK_REF = '__slotFallbackRef';
/**
 * Ref of rendered children from the slot.
 */
export const SLOTTED_CHILD_REF = '__slotAssignmentRef';
