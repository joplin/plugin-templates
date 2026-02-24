import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class NumberCustomVariable extends CustomVariable {
    static definitionName = "number";

    protected inputHTML(): string {
        // Using type="text" with inputmode="decimal" instead of type="number"
        // to avoid a Mac M1 / Chromium bug where native number inputs silently
        // replace typed values with different numbers.
        // See: https://github.com/joplin/plugin-templates/issues/143
        return `<input name="${encode(this.name)}" type="text" inputmode="decimal" pattern="-?[0-9]*\\.?[0-9]*" placeholder="Enter a number"></input>`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): number {
        return Number.parseFloat(input);
    }
}
