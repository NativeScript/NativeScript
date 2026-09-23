/**
 * Keys under which NativeScript stores its callbacks object and frame id on native
 * activity and fragment instances.
 *
 * They live in a module with no imports of its own so code outside `ui/frame` can read
 * them without pulling in the frame implementation, which closes a require cycle.
 */
export const FRAMEID = '_frameId';
export const CALLBACKS = '_callbacks';
