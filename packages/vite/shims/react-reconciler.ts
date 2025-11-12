/**
 * Shim for react-reconciler to fix namespace call issues
 * This resolves the "Cannot call a namespace" error
 */

// Import the actual reconciler
import * as ReactReconcilerModule from 'react-reconciler';

// Export the reconciler as a callable function, not a namespace
const ReactReconciler = ReactReconcilerModule.default || ReactReconcilerModule;

// Re-export everything from the module
export * from 'react-reconciler';

// Export the main reconciler function
export default ReactReconciler;

// Also export as named export for compatibility
export { ReactReconciler };
