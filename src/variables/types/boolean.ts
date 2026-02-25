import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable, InvalidDefinitionError } from "./base";

export class BooleanCustomVariable extends CustomVariable {
    static definitionName = "boolean";
    private defaultValue: boolean;

    constructor(name: string, label: string, defaultValue = true) {
        super(name, label);
        this.defaultValue = defaultValue;
    }

    protected inputHTML(): string {
        const yesSelected = this.defaultValue ? " selected" : "";
        const noSelected = !this.defaultValue ? " selected" : "";
        
        return (
            `
            <select name="${encode(this.name)}">
                <option value="true"${yesSelected}>Yes</option>
                <option value="false"${noSelected}>No</option>
            </select>
            `
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): boolean {
        return input === "true";
    }

    static createFromDefinition(name: string, definition: unknown): CustomVariable {
        if (typeof definition === "string" && definition.trim() === this.definitionName) {
            return new this(name, name, true);
        } else if (typeof definition === "object" && definition !== null) {
            if ("type" in definition) {
                const variableType = definition["type"];
                if (typeof variableType === "string" && variableType.trim() === this.definitionName) {
                    let label = name;
                    if ("label" in definition && typeof definition["label"] === "string") {
                        label = definition["label"].trim();
                    }

                    let defaultValue = true;
                    if ("default" in definition && typeof definition["default"] === "string") {
                        const defaultStr = definition["default"].trim().toLowerCase();
                        if (defaultStr === "no" || defaultStr === "false") {
                            defaultValue = false;
                        } else if (defaultStr === "yes" || defaultStr === "true") {
                            defaultValue = true;
                        }
                        // Invalid values fallback to true (existing behavior)
                    }

                    return new this(name, label, defaultValue);
                }
            }
        }

        throw new InvalidDefinitionError();
    }
}
