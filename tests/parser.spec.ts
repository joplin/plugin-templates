import joplin from "api";
import * as dedent from "dedent";

import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { Logger } from "@templates/logger";
import { Parser } from "@templates/parser";

import * as templateVariableViews from "@templates/views/templateVariables";
import * as folderUtils from "@templates/utils/folders";

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

        // Parser sets handlebars helpers only once in constructor block
        // and it outlives the scope of the parser as the helpers are set on
        // Handlebars level. So, just reset to default before running each test.
        new Parser(dateAndTimeUtils, "variable-dialog", logger);
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
            03/12/2021 20:43
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

    test("should parse special variables correctly", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                title: dropdown(Title 1, Title 2)
                project: dropdown(project 1, project 2)
                notebook_id:\n  label: Select notebook ID\n  type: dropdown(82d2384b025f4458, 8e4d3851a1237028)
                template_title: Scrum - {{ project }} - {{ title }}
                template_tags: scrum, {{ project }}
                template_notebook: {{ notebook_id }}

                ---

                title: {{ title }}
                project: {{ project }}
                notebook_id: {{ notebook_id }}
                template_title: {{ template_title }}
                template_tags: {{ template_tags }}
                template_notebook: {{ template_notebook }}
            `
        };
        testVariableTypes({
            title: EnumCustomVariable,
            project: EnumCustomVariable,
            notebook_id: EnumCustomVariable
        }, (v) => {
            expect(v.notebook_id.toHTML()).toContain("Select notebook ID");
        });

        handleVariableDialog("ok", {
            title: "Title 1",
            project: "Project 2",
            notebook_id: "8e4d3851a1237028"
        });
        jest.spyOn(folderUtils, "doesFolderExist").mockImplementation(async (folderId: string) => {
            return folderId === "8e4d3851a1237028";
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toEqual("8e4d3851a1237028");
        expect(parsedTemplate.tags).toStrictEqual(["scrum", "Project 2"]);
        expect(parsedTemplate.title).toEqual("Scrum - Project 2 - Title 1");
        expect(parsedTemplate.body).toEqual(dedent`
            title: Title 1
            project: Project 2
            notebook_id: 8e4d3851a1237028
            template_title: Scrum - Project 2 - Title 1
            template_tags: scrum, Project 2
            template_notebook: 8e4d3851a1237028
        `);
    });

    test("should parse auto incremented prefix special variables correctly", async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jest.spyOn(joplin.data, "get").mockImplementation(async (path, query) => {
            console.log("GET CALLED");
            return { items: [], has_more: false };
        });
        const parsedTemplate = await parser.parseTemplate({
            id: "note-id",
            title: "Some template",
            body: dedent`
                ---
                template_auto_incremented_prefix: "TEST"

                ---
            `
        });
        expect(parsedTemplate.title).toEqual("TEST-1: Some template");
    });

    test("should parse auto incremented prefix special variables and increment title correctly", async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jest.spyOn(joplin.data, "get").mockImplementation(async (path, query) => {
            console.log("GET CALLED");
            return {
                items: [{
                    id: "notebook id",
                    title: "TEST-100: Some template",
                }],
                has_more: false
            };
        });
        const parsedTemplate = await parser.parseTemplate({
            id: "note-id",
            title: "Some template",
            body: dedent`
                ---
                template_auto_incremented_prefix: "TEST"

                ---
            `
        });
        expect(parsedTemplate.title).toEqual("TEST-101: Some template");
    });

    test("should show an error message if value of a special variable is not a string", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                template_title:\n  label: Enter the value of title\n  type: text

                ---

                title: {{ template_title }}
            `
        };

        let errorMessageShown = false;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async () => {
            errorMessageShown = true;
            return 0;
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(errorMessageShown).toBeTruthy();
        expect(parsedTemplate).toBeNull();
    });

    test("should show an error message if notebook defined in templates_notebook doesn't exist", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                template_notebook: nasdjnkasjdnashbd

                ---

                notebook: {{ template_notebook }}
            `
        };

        let errorMessageShown = false;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async (message: string) => {
            errorMessageShown = true;
            expect(message).toContain("There is no notebook with ID: nasdjnkasjdnashbd");
            return 0;
        });
        jest.spyOn(folderUtils, "doesFolderExist").mockImplementation(async () => {
            return false;
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(errorMessageShown).toBeTruthy();
        expect(parsedTemplate).toBeNull();
    });

    test("should show an error message if an invalid variable name is defined", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                invalid@var: text

                ---

                error: {{ invalid@var }}
            `
        };

        let errorMessageShown = false;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async (message: string) => {
            errorMessageShown = true;
            expect(message).toContain("Variable name \"invalid@var\" is invalid.");
            return 0;
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(errorMessageShown).toBeTruthy();
        expect(parsedTemplate).toBeNull();
    });

    test("should skip empty values in tags special variable", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                genre: text
                status: dropdown(, finished, unfinished)
                template_tags: books, {{genre}},{{status}}

                ---
            `
        };
        testVariableTypes({
            genre: TextCustomVariable,
            status: EnumCustomVariable
        });

        handleVariableDialog("ok", {
            genre: "",
            status: "finished"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.tags).toStrictEqual(["books", "finished"]);
    });

    test("should format custom date and time variable according to user config", async () => {
        const dateFormat = "DD.MM.YYYY";
        const timeFormat = "HH.mm";
        const dateAndTimeUtils = new DateAndTimeUtils(userLocale, dateFormat, timeFormat);
        const parser = new Parser(dateAndTimeUtils, "variable-dialog", logger);

        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                some_date: date
                some_time: time

                ---

                some_date: {{ some_date }}
                some_time: {{ some_time }}
            `
        };
        testVariableTypes({
            some_date: DateCustomVariable,
            some_time: TimeCustomVariable
        });

        handleVariableDialog("ok", {
            some_date: "2023-05-09",
            some_time: "17:25"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            some_date: 09.05.2023
            some_time: 17.25
        `);
    });

    // Math helper.
    test("should support math helper", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                num1: text
                num2: number

                ---

                {{ math num1 "+" num2 }}
                {{ math num2 "**" 2 }}
                {{ math 2 "-" num1 }}
                {{ math num1 "/" 2 }}
                {{ math num2 "*" num1 }}
                {{ math (math num1 "+" num2) "%" 3 }}
                {{ math num2 "/" (math num1 "-" num1) }}
            `
        };
        testVariableTypes({
            num1: TextCustomVariable,
            num2: NumberCustomVariable,
        });

        handleVariableDialog("ok", {
            num1: "11",
            num2: "4"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            15
            16
            -9
            5.5
            44
            0
            Infinity
        `);
    });

    test("should show error with invalid usage of math helpers", async () => {
        const invalidTemplates = [];
        invalidTemplates.push(dedent`
            ---
            num1: text

            ---

            {{ math num1 "+" num1 }}
        `);

        invalidTemplates.push(dedent`
            ---
            num1: boolean

            ---

            {{ math num1 "+" num1 }}
        `);

        invalidTemplates.push(dedent`
            {{ math 2 "%" 0 }}
        `);
        testVariableTypes({
            num1: CustomVariable,
        });

        handleVariableDialog("ok", {
            num1: "true",
        });

        let errorMessagesShown = 0;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async () => {
            errorMessagesShown++;
            return 0;
        });

        for (const body of invalidTemplates) {
            await parser.parseTemplate({
                id: "some-id",
                title: "some template",
                body,
            });
        }

        expect(errorMessagesShown).toEqual(invalidTemplates.length);
    });

    // Repeat helper.
    test("should support repeat helper", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                num1: number
                var1: text

                ---

                {{#repeat num1 }}
                {{ var1 }}

                {{#if (compare repeat_index "==" 0)}}
                Test
                {{else}}
                {{#repeat 2}}
                Hi {{ repeat_index }}
                {{/repeat}}
                {{/if}}

                {{/repeat}}eof
            `
        };
        testVariableTypes({
            num1: NumberCustomVariable,
            var1: TextCustomVariable,
        });

        handleVariableDialog("ok", {
            num1: "3",
            var1: "v"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            v

            Test

            v

            Hi 0
            Hi 1

            v

            Hi 0
            Hi 1

            eof
        `);
    });

    test("should show error with invalid usage of repeat helper", async () => {
        const invalidTemplates = [];
        invalidTemplates.push(dedent`
            ---
            var1: text

            ---

            {{#repeat var1 }}
            Hi
            {{/repeat}}
        `);

        invalidTemplates.push(dedent`
            ---
            var1: text

            ---

            {{#repeat (compare var1 "==" var1) }}
            Hi
            {{/repeat}}
        `);
        testVariableTypes({
            var1: TextCustomVariable,
        });

        handleVariableDialog("ok", {
            var1: "abc",
        });

        let errorMessagesShown = 0;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async () => {
            errorMessagesShown++;
            return 0;
        });

        for (const body of invalidTemplates) {
            await parser.parseTemplate({
                id: "some-id",
                title: "some template",
                body,
            });
        }

        expect(errorMessagesShown).toEqual(invalidTemplates.length);
    });

    // Case helper.
    test("should support case helper", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                var1: text

                ---

                {{ case "upper" var1 }}
                {{ case "lower" var1 }}
                {{ case "upper" (condition false "!") }}
            `
        };
        testVariableTypes({
            var1: TextCustomVariable,
        });

        handleVariableDialog("ok", {
            var1: "Variable"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            VARIABLE
            variable
            TRUE
        `);
    });

    test("should show error with invalid usage of case helper", async () => {
        const invalidTemplates = [];
        invalidTemplates.push(dedent`
            ---
            var1: text

            ---

            {{ case "random" var1 }}
        `);

        testVariableTypes({
            var1: TextCustomVariable,
        });

        handleVariableDialog("ok", {
            var1: "abc",
        });

        let errorMessagesShown = 0;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async () => {
            errorMessagesShown++;
            return 0;
        });

        for (const body of invalidTemplates) {
            await parser.parseTemplate({
                id: "some-id",
                title: "some template",
                body,
            });
        }

        expect(errorMessagesShown).toEqual(invalidTemplates.length);
    });

    // Compare helper.
    test("should support compare helper", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                var1: text
                var2: number
                var3: number
                var4: boolean

                ---

                {{ compare "val1" "===" var1 }}
                {{ compare 0 "==" "" }}
                {{ compare "val1" "!=" var1 }}
                {{ compare 0 "!==" "" }}
                {{ compare var2 ">" var3 }}
                {{ compare (math var2 "*" 2) ">" var3 }}
                {{ compare (math var2 "*" 2) ">=" var3 }}
                {{ compare var2 "<" var3 }}
                {{ compare var2 "<=" (math var3 "/" 2) }}
                {{ compare (compare var4 "!=" true) "==" var4 }}
            `
        };
        testVariableTypes({
            var1: TextCustomVariable,
            var2: NumberCustomVariable,
            var3: NumberCustomVariable,
            var4: BooleanCustomVariable,
        });

        handleVariableDialog("ok", {
            var1: "val1",
            var2: "20",
            var3: "40",
            var4: "false"
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            true
            true
            false
            true
            false
            false
            true
            true
            true
            false
        `);
    });

    test("should show error with invalid usage of compare helper", async () => {
        const invalidTemplates = [];
        invalidTemplates.push(dedent`
            ---
            var1: text

            ---

            {{ compare var1 "random" 0 }}
        `);

        testVariableTypes({
            var1: TextCustomVariable,
        });

        handleVariableDialog("ok", {
            var1: "abc",
        });

        let errorMessagesShown = 0;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async () => {
            errorMessagesShown++;
            return 0;
        });

        for (const body of invalidTemplates) {
            await parser.parseTemplate({
                id: "some-id",
                title: "some template",
                body,
            });
        }

        expect(errorMessagesShown).toEqual(invalidTemplates.length);
    });

    // Condition helper.
    test("should support condition helper", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                var1: number
                var2: number
                var3: boolean

                ---

                {{ condition true "&&" false }}
                {{ condition true "&&" true }}
                {{ condition true "||" false }}
                {{ condition false "!" }}
                {{ condition true "&&" (compare var3 "==" true) }}
                {{ condition true "&&" (condition (compare var1 "!=" var2) "!") }}
            `
        };
        testVariableTypes({
            var1: NumberCustomVariable,
            var2: NumberCustomVariable,
            var3: BooleanCustomVariable,
        });

        handleVariableDialog("ok", {
            var1: "20",
            var2: "40",
            var3: "true",
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            false
            true
            true
            true
            true
            false
        `);
    });

    test("should show error with invalid usage of condition helper", async () => {
        const invalidTemplates = [];
        invalidTemplates.push(dedent`
            {{ condition false "~~" }}
        `);

        let errorMessagesShown = 0;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async () => {
            errorMessagesShown++;
            return 0;
        });

        for (const body of invalidTemplates) {
            await parser.parseTemplate({
                id: "some-id",
                title: "some template",
                body,
            });
        }

        expect(errorMessagesShown).toEqual(invalidTemplates.length);
    });

    // Datetime helper.
    test("should support datetime helper", async () => {
        const template = {
            id: "note-id",
            title: "Some Template",
            body: dedent`
                ---
                var1: number

                ---

                {{ datetime }}
                {{ datetime format="[]YYYY[-]MM[-]DD[ ]HH[:]mm[:]ss" }}
                {{ datetime delta_years="2" delta_months=-1 }}
                {{ datetime delta_days=(math -1 "*" var1) }}
                {{ datetime delta_days=1 delta_hours=(math -24 "*" var1) delta_minutes="56" }}
                {{ datetime delta_seconds=8 format="HH:mm:ss" }}
                {{ datetime set_date=bowm delta_days="1" format="DD/MM/YYYY, dddd" }}
                {{ datetime set_time="23:33" delta_minutes="-33" format="HH:mm:ss" }}
            `
        };
        testVariableTypes({
            var1: NumberCustomVariable,
        });

        handleVariableDialog("ok", {
            var1: "20",
        });
        const parsedTemplate = await parser.parseTemplate(template);
        expect(parsedTemplate.folder).toBeNull();
        expect(parsedTemplate.tags.length).toEqual(0);
        expect(parsedTemplate.title).toEqual("Some Template");
        expect(parsedTemplate.body).toEqual(dedent`
            12/08/2021 17:04
            2021-08-12 17:04:54
            12/07/2023 17:04
            23/07/2021 17:04
            24/07/2021 18:00
            17:05:02
            10/08/2021, Tuesday
            23:00:00
        `);
    });

    test("should show error with invalid usage of datetime helper", async () => {
        const invalidTemplates = [];
        invalidTemplates.push(dedent`
            {{ datetime delta_hours="abc" }}
        `);
        invalidTemplates.push(dedent`
            {{ datetime set_time="23:62" delta_minutes="-33" format="HH:mm:ss" }}
        `);
        invalidTemplates.push(dedent`
            {{ datetime set_date="23:33" }}
        `);

        let errorMessagesShown = 0;
        jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async () => {
            errorMessagesShown++;
            return 0;
        });

        for (const body of invalidTemplates) {
            console.log(await parser.parseTemplate({
                id: "some-id",
                title: "some template",
                body,
            }));
        }

        expect(errorMessagesShown).toEqual(invalidTemplates.length);
    });
});
