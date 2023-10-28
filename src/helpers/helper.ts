import * as Handlebars from "handlebars/dist/handlebars";
import { HelperContext } from "./context";

export type HelperConstructorBlock = (ctx: HelperContext) => HandlebarsHelper;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HelperImpl = (...args: Array<any>) => any;

export class HandlebarsHelper {
    private tag: string;
    private impl: HelperImpl;

    constructor(tag: string, impl: HelperImpl) {
        this.tag = tag;
        this.impl = impl;
    }

    public register(): void {
        Handlebars.registerHelper(this.tag, this.impl);
    }
}
