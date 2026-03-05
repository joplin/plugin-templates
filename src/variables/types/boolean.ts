import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable, InvalidDefinitionError } from "./base";

export class BooleanCustomVariable extends CustomVariable {
    static definitionName = "boolean";
    private defaultValue: boolean | null;

    constructor(name: string, label: string, rawDefault: string | boolean | number | null = null) {
        super(name, label, rawDefault);
        this.defaultValue = BooleanCustomVariable.parseBooleanDefault(rawDefault);
    }

    protected inputHTML(): string {
        const yesSelected = this.defaultValue === true ? " selected" : "";
        const noSelected = this.defaultValue === false ? " selected" : "";

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

    private static parseBooleanDefault(rawDefault: string | boolean | number | null): boolean | null {
        if (rawDefault === null) return null;
        if (typeof rawDefault === "boolean") return rawDefault;
        if (typeof rawDefault === "string") {
            const normalized = rawDefault.trim().toLowerCase();
            if (normalized === "true" || normalized === "yes") return true;
            if (normalized === "false" || normalized === "no") return false;
        }

        throw new InvalidDefinitionError("Invalid boolean default");
    }
}
