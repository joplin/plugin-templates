import joplin from "api";

import * as assert from "assert";
import * as dedent from "dedent";
import * as Handlebars from "handlebars/dist/handlebars";
import * as moment from "moment";

import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { HelperFactory } from "@templates/helpers/index";
import { Logger } from "@templates/logger";
import { Parser } from "@templates/parser";

import { CustomVariable } from "@templates/variables/types/base";
import { TextCustomVariable } from "@templates/variables/types/text";

import * as templateVariableViews from "@templates/views/templateVariables";

describe("datetime helper", () => {
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";
    const userLocale = "en_GB";

    // 30 November 2025, the day the bug was reported on. November has 30
    // days, so a date of the 31st overflows into December when it is set
    // while this is "now".
    const testTime = new Date(2025, 10, 30, 12, 0, 0).getTime();

    const render = (template: string) => Handlebars.compile(template)({});

    beforeAll(() => {
        HelperFactory.registerHelpers(new DateAndTimeUtils(userLocale, dateFormat, timeFormat));
    });

    beforeEach(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(testTime);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("should keep the day of the date that was set (#114)", () => {
        expect(render("{{ datetime set_date='31/12/2025' format='YYYY-MM-DD' }}")).toEqual("2025-12-31");
    });

    test("should keep the day of the date that was set when the month changes (#114)", () => {
        expect(render("{{ datetime set_date='31/01/2026' format='YYYY-MM-DD' }}")).toEqual("2026-01-31");
    });

    test("should keep the day of the date that was set when the year changes (#114)", () => {
        expect(render("{{ datetime set_date='31/12/2026' format='YYYY-MM-DD' }}")).toEqual("2026-12-31");
    });

    test("should keep the day of the date that was set in February (#114)", () => {
        jest.setSystemTime(new Date(2025, 1, 28, 12, 0, 0).getTime());

        expect(render("{{ datetime set_date='31/03/2025' format='YYYY-MM-DD' }}")).toEqual("2025-03-31");
    });

    test("should calculate a date after the date that was set (#114)", () => {
        expect(render("{{ datetime set_date='31/12/2025' delta_days=7 format='YYYY-MM-DD' }}")).toEqual("2026-01-07");
    });

    test("should calculate a date before the date that was set (#114)", () => {
        expect(render("{{ datetime set_date='31/12/2025' delta_days=-14 format='YYYY-MM-DD' }}")).toEqual("2025-12-17");
    });

    test("should calculate a month after the date that was set (#114)", () => {
        expect(render("{{ datetime set_date='31/12/2025' delta_months=1 format='YYYY-MM-DD' }}")).toEqual("2026-01-31");
    });

    test("should calculate a year after the date that was set (#114)", () => {
        expect(render("{{ datetime set_date='31/12/2025' delta_years=1 format='YYYY-MM-DD' }}")).toEqual("2026-12-31");
    });

    test("should keep the day of the date that was set together with a time (#114)", () => {
        expect(render("{{ datetime set_date='31/12/2025' set_time='23:33' format='YYYY-MM-DD HH:mm' }}")).toEqual("2025-12-31 23:33");
    });

    test("should keep a leap day (#114)", () => {
        expect(render("{{ datetime set_date='29/02/2024' format='YYYY-MM-DD' }}")).toEqual("2024-02-29");
    });

    test("should keep the day of a date the current month is long enough for", () => {
        expect(render("{{ datetime set_date='15/06/2027' format='YYYY-MM-DD' }}")).toEqual("2027-06-15");
    });

    test("should support the deltas without a date that is set", () => {
        const tomorrow = moment(new Date().getTime()).add(1, "days").format("YYYY-MM-DD");
        expect(render("{{ datetime delta_days=1 format='YYYY-MM-DD' }}")).toEqual(tomorrow);
    });
});

describe("datetime helper in a template", () => {
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";
    const userLocale = "en_GB";

    const dateAndTimeUtils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
    const logger = new Logger(__dirname);

    // 30 November 2025, the day the bug was reported on.
    const testTime = new Date(2025, 10, 30, 12, 0, 0).getTime();

    const handleVariableDialog = (variables: { [name: string]: string }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jest.spyOn(joplin.views.dialogs, "open").mockImplementation(async (handle: string) => {
            return {
                id: "ok",
                formData: {
                    variables
                }
            };
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers("modern");
        jest.setSystemTime(testTime);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jest.spyOn(templateVariableViews, "setTemplateVariablesView").mockImplementation(async (handle: string, title: string, variableDict: { [name: string]: CustomVariable }) => {
            expect(variableDict["deadline"] instanceof TextCustomVariable).toBeTruthy();
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test("should calculate the dates of a template from its deadline (#114)", async () => {
        const parser = new Parser(dateAndTimeUtils, "variable-dialog", logger);

        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                deadline: text
                ---

                Mid-Project Review: {{ datetime set_date=deadline delta_days=-14 format="YYYY-MM-DD" }}
                Project Closure: {{ datetime set_date=deadline delta_days=7 format="YYYY-MM-DD" }}
            `
        };

        handleVariableDialog({
            deadline: "31/12/2025"
        });

        const parsedTemplate = await parser.parseTemplate(template);

        assert(parsedTemplate);
        expect(parsedTemplate.body).toEqual(dedent`
            Mid-Project Review: 2025-12-17
            Project Closure: 2026-01-07
        `);
    });
});
