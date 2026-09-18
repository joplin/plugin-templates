import { HandlebarsHelper, HelperConstructorBlock } from "./helper";

export const repeatHelper: HelperConstructorBlock = (ctx) => {
    return new HandlebarsHelper("repeat", function (rawNum, options) {
        const num = Number.parseInt(rawNum);

        if (Number.isNaN(num)) {
            throw new Error(`Can't convert "${rawNum}" to number while using repeat`);
        }

        let ret = "";
        for (let i = 0; i < num; i++) {
            ret += options.fn({ ...this, "repeat_index": i });
        }
        return ret;
    });
};
