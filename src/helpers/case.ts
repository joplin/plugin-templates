import { HandlebarsHelper, HelperConstructorBlock } from "./helper";

export const caseHelper: HelperConstructorBlock = ctx => {
    return new HandlebarsHelper("case", (type, rawV1): string => {
        const v1 = new String(rawV1);

        switch (type) {
            case "upper":
                return v1.toUpperCase();
            case "lower":
                return v1.toLowerCase();
            default:
                throw new Error(`Invalid case type used with case: ${type}`);
        }
    });
};
