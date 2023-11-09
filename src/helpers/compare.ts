import { HandlebarsHelper, HelperConstructorBlock } from "./helper";

export const compareHelper: HelperConstructorBlock = ctx => {
    return new HandlebarsHelper("compare", (v1, operator, v2): boolean => {
        switch (operator) {
            case "==":
            case "eq":
            case "equals":
                return (v1 == v2);
            case "===":
            case "seq":
            case "strictly-equals":
                return (v1 === v2);
            case "!=":
            case "ne":
            case "not-equals":
                return (v1 != v2);
            case "!==":
            case "sne":
            case "strictly-not-equals":
                return (v1 !== v2);
            case "<":
            case "lt":
            case "less-than":
                return (v1 < v2);
            case "<=":
            case "lte":
            case "less-than-equals":
                return (v1 <= v2);
            case ">":
            case "gt":
            case "greater-than":
                return (v1 > v2);
            case ">=":
            case "gte":
            case "greater-than-equals":
                return (v1 >= v2);
            default:
                throw new Error(`Invalid comparison operator used with compare: ${operator}`);
        }
    });
};
