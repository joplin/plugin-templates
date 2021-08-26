import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class BooleanCustomVariable extends CustomVariable {
    static definitionName = "boolean";

    protected inputHTML(): string {
        return (
            `
            <select name="${encode(this.name)}">
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
            `
        );
    }

    public processInput(input: string): boolean {
        return input === "true";
    }
}
