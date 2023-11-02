import { HandlebarsHelper, HelperConstructorBlock } from "./helper";
import { AttributeValueType, AttributeDefinition, AttributeParser } from "./utils/attributes";
import * as moment from "moment";

const FORMAT = "format";
const DELTA_YEARS = "delta_years";
const DELTA_MONTHS = "delta_months";
const DELTA_DAYS = "delta_days";
const DELTA_HOURS = "delta_hours";
const DELTA_MINUTES = "delta_minutes";
const DELTA_SECONDS = "delta_seconds";

export const advancedDatetimeHelper: HelperConstructorBlock = (ctx) => {
    const schema: AttributeDefinition[] = [
        {
            name: FORMAT,
            valueType: AttributeValueType.String,
            defaultValue: ctx.dateAndTimeUtils.getDateTimeFormat()
        },
        {
            name: DELTA_YEARS,
            valueType: AttributeValueType.Number,
            defaultValue: 0
        },
        {
            name: DELTA_MONTHS,
            valueType: AttributeValueType.Number,
            defaultValue: 0
        },
        {
            name: DELTA_DAYS,
            valueType: AttributeValueType.Number,
            defaultValue: 0
        },
        {
            name: DELTA_HOURS,
            valueType: AttributeValueType.Number,
            defaultValue: 0
        },
        {
            name: DELTA_MINUTES,
            valueType: AttributeValueType.Number,
            defaultValue: 0
        },
        {
            name: DELTA_SECONDS,
            valueType: AttributeValueType.Number,
            defaultValue: 0
        }
    ];

    return new HandlebarsHelper("advanced_datetime", function (options) {
        const parser = new AttributeParser(schema);
        const attrs = parser.parse(options.hash);

        const now = moment(new Date().getTime());
        now.add(attrs[DELTA_YEARS] as number, "years");
        now.add(attrs[DELTA_MONTHS] as number, "months");
        now.add(attrs[DELTA_DAYS] as number, "days");
        now.add(attrs[DELTA_HOURS] as number, "hours");
        now.add(attrs[DELTA_MINUTES] as number, "minutes");
        now.add(attrs[DELTA_SECONDS] as number, "seconds");

        return ctx.dateAndTimeUtils.formatMsToLocal(now.toDate().getTime(), attrs[FORMAT] as string);
    });
};
