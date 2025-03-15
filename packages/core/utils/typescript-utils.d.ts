/**
 * Makes the specified properties in a type optional.
 * @example type NotifyData = Optional<EventData, "object">
 * // returns: { eventName: string; object?: Observable }
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

/**
 * Determines if a string type ends with a specified suffix.
 * @example type IsChangeEvent = EndsWith<"propertyNameChange", "Change", true, false>
 * // returns: true
 * @example type IsChangeEvent = EndsWith<"someEvent", "Change", true, false>
 * // returns: false
 */
export type EndsWith<T extends string, S extends string, PassType = true, FailType = false> = T extends `${infer _}${S}` ? PassType : FailType;