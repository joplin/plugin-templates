import { HandlebarsHelper, HelperConstructorBlock } from "./helper";
import { AttributeValueType, AttributeDefinition, AttributeParser } from "./utils/attributes";
import * as moment from "moment";

const FORMAT = "format";
const SET_DATE = "set_date";
const SET_TIME = "set_time";
const DELTA_YEARS = "delta_years";
const DELTA_MONTHS = "delta_months";
const DELTA_DAYS = "delta_days";
const DELTA_HOURS = "delta_hours";
const DELTA_MINUTES = "delta_minutes";
const DELTA_SECONDS = "delta_seconds";

export const datetimeHelper: HelperConstructorBlock = (ctx) => {
    const schema: AttributeDefinition[] = [
        {
            name: FORMAT,
            valueType: AttributeValueType.String,
            defaultValue: ctx.dateAndTimeUtils.getDateTimeFormat()
        },
        {
            name: SET_DATE,
            valueType: AttributeValueType.String,
            defaultValue: ""
        },
        {
            name: SET_TIME,
            valueType: AttributeValueType.String,
            defaultValue: ""
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

    return new HandlebarsHelper("datetime", function (options) {
        const parser = new AttributeParser(schema);
        const attrs = parser.parse(options.hash);

        const now = moment(new Date().getTime());

        if (attrs[SET_DATE]) {
            const parsedDate = ctx.dateAndTimeUtils.parseDate(attrs[SET_DATE] as string, ctx.dateAndTimeUtils.getDateFormat());
            now.set("date", parsedDate.date);
            now.set("month", parsedDate.month);
            now.set("year", parsedDate.year);
        }

        if (attrs[SET_TIME]) {
            const parsedTime = ctx.dateAndTimeUtils.parseTime(attrs[SET_TIME] as string, ctx.dateAndTimeUtils.getTimeFormat());
            now.set("hours", parsedTime.hours);
            now.set("minutes", parsedTime.minutes);
            now.set("seconds", 0);
            now.set("milliseconds", 0);
        }

        now.add(attrs[DELTA_YEARS] as number, "years");
        now.add(attrs[DELTA_MONTHS] as number, "months");
        now.add(attrs[DELTA_DAYS] as number, "days");
        now.add(attrs[DELTA_HOURS] as number, "hours");
        now.add(attrs[DELTA_MINUTES] as number, "minutes");
        now.add(attrs[DELTA_SECONDS] as number, "seconds");

        return ctx.dateAndTimeUtils.formatMsToLocal(now.toDate().getTime(), attrs[FORMAT] as string);
    });
};
