import * as moment from "moment";

// These are meant to parse the date and time formats
// supported by Joplin. It doesn't support seconds or
// milliseconds.
interface ParsedDate {
    date: number;
    month: number;
    year: number;
}

interface ParsedTime {
    hours: number;
    minutes: number;
    seconds: number;
}

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

    public formatLocalToJoplinCompatibleUnixTime(input: string, format: string = null): number {
        if (!format) {
            format = this.getDateTimeFormat();
        }

        const date = moment(input, format, true);
        if (!date.isValid()) {
            throw new Error(`Was not able to parse ${input} according to format ${format}`);
        }

        return date.unix() * 1000;
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

    public parseDate(input: string, format: string): ParsedDate {
        const date = moment(input, format, true);

        if (!date.isValid()) {
            throw new Error(`Was not able to parse ${input} according to format ${format}`);
        }

        return {
            date: date.date(),
            month: date.month(),
            year: date.year(),
        };
    }

    public parseTime(input: string, format: string): ParsedTime {
        const time = moment(input, format, true);

        if (!time.isValid()) {
            throw new Error(`Was not able to parse ${input} according to format ${format}`);
        }

        return {
            hours: time.hours(),
            minutes: time.minutes(),
            seconds: time.seconds(),
        };
    }
}
