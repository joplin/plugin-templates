type NamedPromises = Record<string, Promise<unknown>>;

type ResolvedNamedPromises<T extends NamedPromises> = {
    [K in keyof T]: Awaited<T[K]>;
};

export async function resolveNamedPromises<T extends NamedPromises>(promises: T): Promise<ResolvedNamedPromises<T>> {
    const entries = Object.entries(promises) as [keyof T, T[keyof T]][];
    const resolvedValues = await Promise.all(entries.map(([, promise]) => promise));

    const resolvedPromises = {} as ResolvedNamedPromises<T>;
    entries.forEach(([key], index) => {
        resolvedPromises[key] = resolvedValues[index] as ResolvedNamedPromises<T>[typeof key];
    });

    return resolvedPromises;
}
