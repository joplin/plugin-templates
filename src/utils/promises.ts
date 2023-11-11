/* eslint-disable @typescript-eslint/no-explicit-any */
export class PromiseGroup {
    private promises: { [key: string]: Promise<any> } = {};
    private unnamedPromises: Promise<any>[] = [];

    public add(promise: Promise<any>): void {
        this.unnamedPromises.push(promise);
    }

    public set(key: string, promise: Promise<any>): void {
        if (key in this.promises) {
            throw new Error(`key: ${key} already in use`);
        }

        this.promises[key] = promise;
    }

    public async groupAll(): Promise<{[key: string]: any}> {
        const namedPromises = Object.entries(this.promises);
        const allPromises = [...this.unnamedPromises, ...namedPromises.map(np => np[1])];

        const resolvedPromises = await Promise.all(allPromises);

        const res = {};
        for (let i = 0; i < namedPromises.length; i++) {
            res[namedPromises[i][0]] = resolvedPromises[this.unnamedPromises.length + i];
        }

        return res;
    }
}
