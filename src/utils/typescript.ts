/** Can be used to filter non empty values from a collection while adhering to typescript
 * strict null checks.
 */
export function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}
