import * as Handlebars from "handlebars/dist/handlebars";
import { DateAndTimeUtils } from "./utils/dateAndTime";

export class Parser {
    private utils: DateAndTimeUtils;

    constructor(dateAndTimeUtils: DateAndTimeUtils) {
        this.utils = dateAndTimeUtils;
    }

    private getDefaultContext() {
        Handlebars.registerHelper("custom_datetime", (options) => {
            return this.utils.getCurrentTime(options.fn(this));
        });

        return {
            date: this.utils.getCurrentTime(this.utils.getDateFormat()),
            time: this.utils.getCurrentTime(this.utils.getTimeFormat()),
            datetime: this.utils.getCurrentTime(),
            bowm: this.utils.formatMsToLocal(this.utils.getBeginningOfWeek(1), this.utils.getDateFormat()),
            bows: this.utils.formatMsToLocal(this.utils.getBeginningOfWeek(0), this.utils.getDateFormat())
        }
    }

    public async parseTemplate(template: string): Promise<string> {
        const compiledTemplate = Handlebars.compile(template);
        return compiledTemplate(this.getDefaultContext());
    }
}
