import joplin from "api";
import * as Handlebars from "handlebars/dist/handlebars";
import { Logger } from "./logger";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { Note } from "./utils/templates";
import { setTemplateVariablesView } from "./views/templateVariables";

// Can't use import for this library because the types in the library
// are declared incorrectly which result in typescript errors.
// Reference -> https://github.com/jxson/front-matter/issues/76
// eslint-disable-next-line @typescript-eslint/no-var-requires
const frontmatter = require("front-matter");

export interface NewNote {
    title: string;
    tags: string[];
    body: string;
}

const NOTE_TITLE_VARIABLE_NAME = "template_title";
const NOTE_TAGS_VARIABLE_NAME = "template_tags";

export class Parser {
    private utils: DateAndTimeUtils;
    private dialog: string;
    private logger: Logger;
    private specialVariableNames = [NOTE_TITLE_VARIABLE_NAME, NOTE_TAGS_VARIABLE_NAME];

    constructor(dateAndTimeUtils: DateAndTimeUtils, dialogViewHandle: string, logger: Logger) {
        this.utils = dateAndTimeUtils;
        this.dialog = dialogViewHandle;
        this.logger = logger;
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

    private mapUserResponseToVariables(variables: Record<string, string>, response: Record<string, string>) {
        const variableValues = {};

        Object.keys(response).map(variable => {
            const variableType = variables[variable].trim();
            const variableResponse = response[variable];

            if (variableType == "boolean") {
                variableValues[variable] = variableResponse === "true";
                return;
            }

            if (variableType == "number") {
                variableValues[variable] = Number.parseFloat(variableResponse);
                return;
            }

            variableValues[variable] = variableResponse;
        });

        return variableValues;
    }

    private checkVariableNames(variableNames: string[]) {
        for (const variable of variableNames) {
            try {
                const compiledBody = Handlebars.compile(`{{ ${variable} }}`);
                compiledBody({});
            } catch {
                throw new Error(`Variable name "${variable}" is invalid.\n\nPlease avoid using special characters ("@", ",", "#", "+", "(", etc.) or spaces in variable names. However, you can use "_" in variable names.`);
            }
        }
    }

    private async getVariableInputs(title: string, variables: Record<string, string>) {
        if (Object.keys(variables).length == 0) {
            return {};
        }

        this.checkVariableNames(Object.keys(variables));

        await setTemplateVariablesView(this.dialog, title, variables);
        const dialogResponse = (await joplin.views.dialogs.open(this.dialog));

        if (dialogResponse.id === "cancel") {
            return null;
        }

        let userResponse;

        // There's a try catch block here because a user experienced an error
        // due to the following line. I've added a try catch block to log the
        // necessary info to find the root cause of the error in case it happens again.
        // Reference -> https://github.com/joplin/plugin-templates/issues/6
        try {
            userResponse = dialogResponse.formData.variables;
        } catch (err) {
            console.error("Template variables form was not able to load properly.", err);
            console.error("DEBUG INFO", variables, dialogResponse, title);

            const message = (`Template variables form was not able to load properly.\n${err}\nDEBUG INFO\nvariables: ${JSON.stringify(variables)}\ndialogResponse: ${JSON.stringify(dialogResponse)}\ntitle: ${JSON.stringify(title)}`);
            this.logger.log(message);

            throw new Error(err);
        }

        return this.mapUserResponseToVariables(variables, userResponse);
    }

    private parseSpecialVariables(specialVariables: Record<string, unknown>, customVariableInputs: Record<string, string>) {
        const res: Record<string, string> = {};
        const context = {
            ...this.getDefaultContext(),
            ...customVariableInputs
        };

        for (const variable of Object.keys(specialVariables)) {
            if (typeof specialVariables[variable] !== "string") {
                throw new Error(`${variable} should be a string, found ${typeof specialVariables[variable]}.`);
            }

            const compiledText = Handlebars.compile(specialVariables[variable]);
            res[variable] = compiledText(context);
        }

        return res;
    }

    private getNoteMetadata(parsedSpecialVariables: Record<string, string>) {
        const meta = {
            title: parsedSpecialVariables.fallback_note_title,
            tags: []
        };

        if (NOTE_TITLE_VARIABLE_NAME in parsedSpecialVariables) {
            meta.title = parsedSpecialVariables[NOTE_TITLE_VARIABLE_NAME];
        }

        if (NOTE_TAGS_VARIABLE_NAME in parsedSpecialVariables) {
            meta.tags = parsedSpecialVariables[NOTE_TAGS_VARIABLE_NAME].split(",").map(t => t.trim());
        }

        return meta;
    }

    private preProcessTemplateBody(templateBody: string) {
        /**
         * This function is supposed to do the following preprocessing.
         * 1. Wrap the value of template_title and template_tags with double quotes if it isn't already.
         */

        templateBody = templateBody.trimStart();

        const getVariableDefinitionsBlock = () => {
            const allLines = templateBody.split("\n");

            if (allLines.length === 0 || allLines[0] !== "---") {
                return null;
            }

            const allMatchesAfterFirstMatch = allLines.map((val, index) => {
                if (index && val === "---") {
                    return index;
                } else {
                    return null;
                }
            }).filter(val => !!val);

            if (!allMatchesAfterFirstMatch.length) {
                return null;
            }

            const blockEndIndex = allMatchesAfterFirstMatch[0];
            return allLines.slice(0, blockEndIndex + 1).join("\n");
        }

        const wrapInQuotes = (definitionsBlock: string, properties: string[]) => {
            for (const prop of properties) {
                // eslint-disable-next-line no-useless-escape
                const pattern = new RegExp(`^[^\S\n]*${prop}[^\S\n]*:.*`, "gm");
                const matches = definitionsBlock.match(pattern);
                if (!matches) {
                    continue;
                }

                const firstMatch = matches[0];

                // Don't do anything if it already contains a double quote
                if (firstMatch.indexOf("\"") !== -1) {
                    continue;
                }

                const splitVal = firstMatch.split(":");
                const wrappedString = `${splitVal[0]}: "${splitVal.slice(1).join(":").trim()}"`;

                definitionsBlock = definitionsBlock.replace(firstMatch, wrappedString);
            }

            return definitionsBlock;
        }

        let variableDefinitionsBlock = getVariableDefinitionsBlock();
        if (!variableDefinitionsBlock) {
            return templateBody;
        }

        const templateContentBlock = templateBody.substr(variableDefinitionsBlock.length, templateBody.length - variableDefinitionsBlock.length);
        variableDefinitionsBlock = wrapInQuotes(variableDefinitionsBlock, this.specialVariableNames);

        return `${variableDefinitionsBlock}${templateContentBlock}`;
    }

    public async parseTemplate(template: Note | null): Promise<NewNote> {
        if (!template) {
            return null;
        }

        template.body = this.preProcessTemplateBody(template.body);

        try {
            const processedTemplate = frontmatter(template.body);
            const templateVariables = processedTemplate.attributes;

            const customVariables = {};
            const specialVariables = {
                fallback_note_title: template.title
            };

            for (const variable of Object.keys(templateVariables)) {
                if (this.specialVariableNames.includes(variable)) {
                    specialVariables[variable] = templateVariables[variable];
                } else {
                    customVariables[variable] = templateVariables[variable];
                }
            }

            const variableInputs = await this.getVariableInputs(template.title, customVariables);
            if (variableInputs === null) {
                return null;
            }

            const parsedSpecialVariables = this.parseSpecialVariables(specialVariables, variableInputs);
            const newNoteMeta = this.getNoteMetadata(parsedSpecialVariables);

            // Remove the fallback property because it's not actually a variable defined by the user.
            delete parsedSpecialVariables.fallback_note_title;

            const context = {
                ...this.getDefaultContext(),
                ...variableInputs,
                ...parsedSpecialVariables
            };

            const templateBody = processedTemplate.body;
            const compiledTemplate = Handlebars.compile(templateBody);

            return {
                ...newNoteMeta,
                body: compiledTemplate(context)
            };
        } catch (err) {
            console.error("Error in parsing template.", err);
            await joplin.views.dialogs.showMessageBox(`There was an error parsing this template, please review it and try again.\n\n${err}`);
            return null;
        }
    }
}
