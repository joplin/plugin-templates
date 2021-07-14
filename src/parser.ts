import joplin from "api";
import * as Handlebars from "handlebars/dist/handlebars";
import { DateAndTimeUtils } from "./utils/dateAndTime";
import { setTemplateVariablesView } from "./views/templateVariables";

// Can't use import for this library because the types in the library
// are declared incorrectly which result in typescript errors.
// Reference -> https://github.com/jxson/front-matter/issues/76
// eslint-disable-next-line @typescript-eslint/no-var-requires
const frontmatter = require("front-matter");

export class Parser {
    private utils: DateAndTimeUtils;
    private dialog: string;

    constructor(dateAndTimeUtils: DateAndTimeUtils, dialogViewHandle: string) {
        this.utils = dateAndTimeUtils;
        this.dialog = dialogViewHandle;
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

    private async getVariableInputs(variables: Record<string, string>) {
        if (Object.keys(variables).length == 0) {
            return {};
        }

        await setTemplateVariablesView(this.dialog, variables);
        const userResponse = (await joplin.views.dialogs.open(this.dialog)).formData.variables;

        return this.mapUserResponseToVariables(variables, userResponse);
    }

    public async parseTemplate(template: string): Promise<string> {
        try {
            const processedTemplate = frontmatter(template);
            const templateVariables = processedTemplate.attributes;
            const context = {
                ...this.getDefaultContext(),
                ...await this.getVariableInputs(templateVariables)
            };

            const templateBody = processedTemplate.body;
            const compiledTemplate = Handlebars.compile(templateBody);

            return compiledTemplate(context);
        } catch (err) {
            console.error("Error in parsing template.", err);
            return "There was some error parsing your template.";
        }
    }
}
