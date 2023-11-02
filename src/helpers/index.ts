import { DateAndTimeUtils } from "../utils/dateAndTime";
import { HelperConstructorBlock } from "./helper";
import { HelperContext } from "./context";

import { customDatetimeHelper } from "./custom_datetime";
import { compareHelper } from "./compare";
import { mathHelper } from "./math";
import { conditionHelper } from "./condition";
import { repeatHelper } from "./repeat";
import { advancedDatetimeHelper } from "./advanced_datetime";
import { caseHelper } from "./case";

export class HelperFactory {
    private static helpers: HelperConstructorBlock[] = [
        customDatetimeHelper,
        compareHelper,
        mathHelper,
        conditionHelper,
        repeatHelper,
        advancedDatetimeHelper,
        caseHelper,
    ];

    static registerHelpers(dateAndTimeUtils: DateAndTimeUtils): void {
        const context = new HelperContext(dateAndTimeUtils);
        for (const helper of this.helpers) {
            helper(context).register();
        }
    }
}
