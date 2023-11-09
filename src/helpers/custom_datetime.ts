import { HandlebarsHelper, HelperConstructorBlock } from "./helper";

export const customDatetimeHelper: HelperConstructorBlock = ctx => {
    return new HandlebarsHelper("custom_datetime", (options) => {
        return ctx.dateAndTimeUtils.getCurrentTime(options.fn(this));
    });
};
