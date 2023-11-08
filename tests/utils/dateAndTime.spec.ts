import { DateAndTimeUtils } from "@templates/utils/dateAndTime";

describe("Date and time utils", () => {
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";
    const userLocale = "en_GB";
    const testTime = 1628787894117; // Thursday 12 August 2021, 17:04:54 UTC

    beforeAll(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(testTime);
    });

    afterAll(() => {
        jest.useRealTimers();
    })

    test("should correctly set date and time formats", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        expect(utils.getDateFormat()).toEqual("DD/MM/YYYY");
        expect(utils.getTimeFormat()).toEqual("HH:mm");
        expect(utils.getDateTimeFormat()).toEqual("DD/MM/YYYY HH:mm");
    });

    test("should correctly get current time with default format", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        expect(utils.getCurrentTime()).toEqual("12/08/2021 17:04");
    });

    test("should correctly get current time with custom format", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        expect(utils.getCurrentTime("MMMM Do YYYY, h:mm:ss a")).toEqual("August 12th 2021, 5:04:54 pm");
    });

    test("should correctly get beginning of week date", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        const bows = utils.formatMsToLocal(utils.getBeginningOfWeek(0), utils.getDateFormat());
        const bowm = utils.formatMsToLocal(utils.getBeginningOfWeek(1), utils.getDateFormat());
        expect(bows).toEqual("08/08/2021");
        expect(bowm).toEqual("09/08/2021");
    });

    test("should correctly parse date", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        const parsedDate = utils.parseDate("2023/19/12", "YYYY/DD/MM");
        expect(parsedDate.date).toEqual(19);
        expect(parsedDate.month).toEqual(11);
        expect(parsedDate.year).toEqual(2023);
    });

    test("should throw error if couldn't parse date", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        expect(() => utils.parseDate("abc", "YYYY/DD/MM")).toThrow();
    });

    test("should correctly parse time", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        const parsedTime = utils.parseTime("04:45 pm", "HH:mm a");
        expect(parsedTime.hours).toEqual(16);
        expect(parsedTime.minutes).toEqual(45);
    });

    test("should throw error if couldn't parse time", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        expect(() => utils.parseTime("04:61 pm", "HH:mm a")).toThrow();
    });
});
