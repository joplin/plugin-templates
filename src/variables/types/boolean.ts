import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class BooleanCustomVariable extends CustomVariable {
    static definitionName = "boolean";

    protected inputHTML(): string {
        return (
            `
            <select name="${encode(this.name)}" aria-label="${encode(this.label)}">
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
            `
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): boolean {
        return input === "true";
    }
}
