// Shim for react-reconciler/constants.js to handle missing exports
// This addresses the issue where react-nativescript tries to import
// exports that don't exist in the current version of react-reconciler

// Event priorities (these are the primary values react-nativescript needs)
export const DefaultEventPriority = 16;
export const DiscreteEventPriority = 1;
export const ContinuousEventPriority = 4;
export const IdleEventPriority = 268435456;

// Mode constants
export const ConcurrentMode = 1;
export const ProfileMode = 2;
export const StrictMode = 8;
export const NoMode = 0;
export const BlockingMode = 2;
export const DebugTracingMode = 4;
export const StrictLegacyMode = 16;
export const StrictEffectsMode = 32;

// Root modes (required by react-nativescript)
export const LegacyRoot = 0;
export const ConcurrentRoot = 1;
