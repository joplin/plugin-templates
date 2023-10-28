import { HandlebarsHelper, HelperConstructorBlock } from "./helper";

export const mathHelper: HelperConstructorBlock = ctx => {
    return new HandlebarsHelper("math", (rawV1, operator, rawV2): number => {
        const v1 = Number.parseFloat(rawV1);
        const v2 = Number.parseFloat(rawV2);

        if (Number.isNaN(v1) || Number.isNaN(v2)) {
            throw new Error(`Can't convert "${rawV1}" and "${rawV2}" to numbers while using math`);
        }

        switch (operator) {
            case "+":
                return v1 + v2;
            case "-":
                return v1 - v2;
            case "*":
                return v1 * v2;
            case "/":
                return v1 / v2;
            default:
                throw new Error(`Invalid operator used with math: ${operator}`);
        }
    });
};
