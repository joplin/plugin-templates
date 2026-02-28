import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class NumberCustomVariable extends CustomVariable {
    static definitionName = "number";

    protected inputHTML(): string {
        return `<input name="${encode(this.name)}" type="number" aria-label="${encode(this.label)}"></input>`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): number {
        return Number.parseFloat(input);
    }
}
