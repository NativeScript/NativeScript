/**
 * Makes the specified properties in a type optional.
 * @example type NotifyData = Optional<EventData, "object">
 * // returns: { eventName: string; object?: Observable }
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };
