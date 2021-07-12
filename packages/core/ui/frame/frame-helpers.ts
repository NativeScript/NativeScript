/**
 * Unique symbol to mark Frame instances.
 *
 * We use a symbol because in some cases importing the Frame to do
 * instanceof checks introduces circular references.
 *
 * Having the symbol in it's own file prevents any potential circular
 * references and allows checking if an object is a frame
 */
export const FRAME_SYMBOL = Symbol('FRAME_SYMBOL');

/**
 * Helper to determine if the passed object is a Frame
 *
 * @param object
 */
export function isFrame(object: any) {
	return object && object[FRAME_SYMBOL] === true;
}
