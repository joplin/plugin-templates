import joplin from "api";
import * as dedent from "dedent";

import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { Logger } from "@templates/logger";
import { Parser } from "@templates/parser";

import * as templateVariableViews from "@templates/views/templateVariables";
import { CustomVariable } from "@templates/variables/types/base";
import { TextCustomVariable } from "@templates/variables/types/text";
import { BooleanCustomVariable } from "@templates/variables/types/boolean";
import { NumberCustomVariable } from "@templates/variables/types/number";
import { DateCustomVariable } from "@templates/variables/types/date";
import { TimeCustomVariable } from "@templates/variables/types/time";
import { EnumCustomVariable } from "@templates/variables/types/enum";

describe("Template parser", () => {
    const dateFormat = "DD/MM/YYYY";
    const timeFormat = "HH:mm";
    const userLocale = "en_GB";
    const testTime = 1628787894117; // Thursday 12 August 2021, 17:04:54 UTC

    const dateAndTimeUtils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
    const logger = new Logger(__dirname);
    const parser = new Parser(dateAndTimeUtils, "variable-dialog", logger);

    const testVariableTypes = (variableTypes: { [name: string]: typeof CustomVariable | typeof EnumCustomVariable }, extraValidations?: (varDict: { [name: string]: CustomVariable }) => void) => {
        jest.spyOn(templateVariableViews, "setTemplateVariablesView").mockImplementation(async (handle: string, title: string, variableDict: { [name: string]: CustomVariable }) => {
            for (const [name, variable] of Object.entries(variableDict)) {
                expect(variable instanceof variableTypes[name]).toBeTruthy();
            }

            if (extraValidations) {
                extraValidations(variableDict);
            }
        });
    };

    const handleVariableDialog = (id: "cancel" | "ok", variables: { [name: string]: string }) => {
        jest.spyOn(joplin.views.dialogs, "open").mockImplementation(async (handle: string) => {
            if (id === "cancel") {
                return {
                    id,
                };
            } else {
                return {
                    id,
                    formData: {
                        variables
                    }
                }
            }
        });
    };

    beforeAll(() => {
        jest.useFakeTimers("modern");
        jest.setSystemTime(testTime);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

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
    });

    test("should parse text, number and boolean custom variables correctly", async () => {
        const template = {
            id: "note-id",
            title: "Some Title",
            body: dedent`
                ---
                some_var: text
                bows: number
                show_summary: boolean
                ---

                bowm: {{ bowm }}
                bows: {{ bows }}
                some_var: {{ some_var }}
                show_summary: {{ show_summary }}

                {{#if show_summary}}
                ## Summary
                > Summary Date - {{ date }}
                {{/if}}
            `
        };
        testVariableTypes({
            some_var: TextCustomVariable,
            bows: NumberCustomVariable,
            show_summary: BooleanCustomVariable
        });

        handleVariableDialog("ok", {
            some_var: "text",
            bows: "12",
            show_summary: "false"
        });
        let parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Title");
        expect(parsedTemplate.body).toEqual(dedent`
            bowm: 09/08/2021
            bows: 12
            some_var: text
            show_summary: false\n\n
        `);

        handleVariableDialog("ok", {
            some_var: "other_text",
            bows: "15",
            show_summary: "true"
        });
        parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Title");
        expect(parsedTemplate.body).toEqual(dedent`
            bowm: 09/08/2021
            bows: 15
            some_var: other_text
            show_summary: true

            ## Summary
            > Summary Date - 12/08/2021\n
        `);
    });

    test("should parse date, time custom variables correctly", async () => {
        const template = {
            id: "note-id",
            title: "Template",
            body: dedent`
                ---
                date_var: date
                time_var: time
                ---

                {{ date_var }} {{ time_var }}
            `
        };
        testVariableTypes({
            date_var: DateCustomVariable,
            time_var: TimeCustomVariable
        });

        handleVariableDialog("ok", {
            date_var: "2021-12-03",
            time_var: "20:43"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Template");
        expect(parsedTemplate.body).toEqual(dedent`
            2021-12-03 20:43
        `);
    });

    test("should parse dropdown custom variable correctly", async () => {
        const template = {
            id: "note-id",
            title: "Template",
            body: dedent`
                ---
                dvar: dropdown(opt1, opt2)
                ---

                Hi, you selected {{ dvar }}.
            `
        };
        testVariableTypes({
            dvar: EnumCustomVariable,
        });

        handleVariableDialog("ok", {
            dvar: "opt2",
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Template");
        expect(parsedTemplate.body).toEqual(dedent`
            Hi, you selected opt2.
        `);
    });

    test("should not parse if custom variable dialog is closed", async () => {
        const template = {
            id: "note-id",
            title: "Template",
            body: dedent`
                ---
                variable_one: text
                ---

                variable_one: {{ variable_one }}
            `
        };
        testVariableTypes({
            variable_one: TextCustomVariable
        });

        handleVariableDialog("cancel", {});
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate).toBeNull();
    });

    test("should parse custom variables with labels correctly", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                variable_one: text
                variable_two:\n  label: Enter something below\n  type: text
                variable_three:\n  label: Choose an option\n  type: dropdown(opt1, opt2, opt3)
                ---

                variable_one: {{ variable_one }}
                variable_two: {{ variable_two }}
                variable_three: {{ variable_three }}
            `
        };
        testVariableTypes({
            variable_one: TextCustomVariable,
            variable_two: TextCustomVariable,
            variable_three: EnumCustomVariable
        }, (v) => {
            expect(v.variable_one.toHTML()).toContain("variable_one");
            expect(v.variable_two.toHTML()).toContain("Enter something below");
            expect(v.variable_three.toHTML()).toContain("Choose an option");
        });

        handleVariableDialog("ok", {
            variable_one: "val1",
            variable_two: "val2",
            variable_three: "opt1"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            variable_one: val1
            variable_two: val2
            variable_three: opt1
        `);
    });
});
