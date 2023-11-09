import { HandlebarsHelper, HelperConstructorBlock } from "./helper";

export const conditionHelper: HelperConstructorBlock = ctx => {
    return new HandlebarsHelper("condition", (v1, operator, v2): boolean => {
        switch (operator) {
            case "!":
            case "not":
                return !v1;
            case "&&":
            case "and":
                return (v1 && v2);
            case "||":
            case "or":
                return (v1 || v2);
            default:
                throw new Error(`Invalid operator used with condition: ${operator}`);
        }
    });
};
