import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable, InvalidDefinitionError } from "./base";

export class BooleanCustomVariable extends CustomVariable {
    static definitionName = "boolean";
    private defaultValue: boolean;

    constructor(name: string, label: string, rawDefault: string | boolean | null = null) {
        super(name, label, rawDefault);
        const parsed = BooleanCustomVariable.parseBooleanDefault(rawDefault);
        this.defaultValue = parsed ?? true;
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

    private static parseBooleanDefault(rawDefault: string | boolean | null): boolean | undefined {
        if (rawDefault === null) return undefined;
        if (typeof rawDefault === "boolean") return rawDefault;
        if (typeof rawDefault === "string") {
            const normalized = rawDefault.trim().toLowerCase();
            if (normalized === "true" || normalized === "yes") return true;
            if (normalized === "false" || normalized === "no") return false;
        }

        throw new InvalidDefinitionError("Invalid boolean default");
    }
}
