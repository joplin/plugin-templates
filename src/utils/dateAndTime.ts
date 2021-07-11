import * as moment from "moment";

export class DateAndTimeUtils {
    private locale: string;
    private dateFormat: string;
    private timeFormat: string;

    constructor(locale: string, dateFormat: string, timeFormat: string) {
        this.locale = locale;
        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;

        moment.locale(this.locale);
    }

    public getDateFormat() {
        return this.dateFormat;
    }

    public getTimeFormat() {
        return this.timeFormat;
    }

    public getDateTimeFormat(): string {
        return `${this.dateFormat} ${this.timeFormat}`;
    }

    public formatMsToLocal(ms: number, format: string = null) {
        if (!format) {
            format = this.getDateTimeFormat();
        }
        return moment(ms).format(format);
    }

    public getCurrentTime(format: string = null) {
        return this.formatMsToLocal(new Date().getTime(), format);
    }

    public getBeginningOfWeek(startIndex: number): number {
        const currentDate = new Date();
        const day = currentDate.getDay();
        const diff = day >= startIndex ? day - startIndex : 6 - day;
        return new Date().setDate(currentDate.getDate() - diff);
    }
}
