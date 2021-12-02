import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { Logger } from "@templates/logger";
import { Parser } from "@templates/parser";

import * as dedent from "dedent";

describe("Template parser", () => {
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";
    const userLocale = "en_GB";
    const testTime = 1628787894117; // Thursday 12 August 2021, 17:04:54 UTC

    const dateAndTimeUtils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
    const logger = new Logger(__dirname);
    const parser = new Parser(dateAndTimeUtils, "variable-dialog", logger);

    beforeAll(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(testTime);
    });

    afterAll(() => {
        jest.useRealTimers();
    })

    test("should parse built-in variables correctly", async () => {
        const parsedTemplate = await parser.parseTemplate({
            id: "note-id",
            title: "Template Title",
            body: dedent`
                date - {{date}}
                time - {{time}}
                datetime - {{datetime}}
                bowm - {{bowm}}
                bows - {{bows}}
                custom_datetime - {{#custom_datetime}}[]YYYY[-]MM[-]DD[ ]HH[:]mm[]{{/custom_datetime}}
            `
        });

        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Template Title");
        expect(parsedTemplate.body).toEqual(dedent`
            date - 12/08/2021
            time - 17:04
            datetime - 12/08/2021 17:04
            bowm - 09/08/2021
            bows - 08/08/2021
            custom_datetime - 2021-08-12 17:04
        `);
    })
});
