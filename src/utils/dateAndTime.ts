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

    public getDateFormat(): string {
        return this.dateFormat;
    }

    public getTimeFormat(): string {
        return this.timeFormat;
    }

    public getDateTimeFormat(): string {
        return `${this.dateFormat} ${this.timeFormat}`;
    }

    public formatMsToLocal(ms: number, format: string = null): string {
        if (!format) {
            format = this.getDateTimeFormat();
        }
        return moment(ms).format(format);
    }

    public getCurrentTime(format: string = null): string {
        return this.formatMsToLocal(new Date().getTime(), format);
    }

    public getBeginningOfWeek(startIndex: number): number {
        // startIndex: 0 for Sunday, 1 for Monday
        const currentDate = new Date();
        const day = currentDate.getDay();
        const diff = day >= startIndex ? day - startIndex : 6 - day;
        return new Date().setDate(currentDate.getDate() - diff);
    }
}
