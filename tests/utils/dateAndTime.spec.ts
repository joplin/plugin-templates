import { DateAndTimeUtils } from "@templates/utils/dateAndTime";

describe("Date and time utils", () => {
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";
    const userLocale = "en_GB";
    const testTime = 1628787894117; // Thursday 12 August 2021, 22:34:54

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
        expect(utils.getCurrentTime()).toEqual("12/08/2021 22:34");
    });

    test("should correctly get current time with custom format", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        expect(utils.getCurrentTime("MMMM Do YYYY, h:mm:ss a")).toEqual("August 12th 2021, 10:34:54 pm");
    });

    test("should correctly get beginning of week date", () => {
        const utils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        const bows = utils.formatMsToLocal(utils.getBeginningOfWeek(0), utils.getDateFormat());
        const bowm = utils.formatMsToLocal(utils.getBeginningOfWeek(1), utils.getDateFormat());
        expect(bows).toEqual("08/08/2021");
        expect(bowm).toEqual("09/08/2021");
    });
});
