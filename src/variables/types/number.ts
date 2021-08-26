import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class NumberCustomVariable extends CustomVariable {
    static definitionName = "number";

    protected inputHTML(): string {
        return `<input name="${encode(this.name)}" type="number"></input>`;
    }

    public processInput(input: string): number {
        return Number.parseFloat(input);
    }
}
