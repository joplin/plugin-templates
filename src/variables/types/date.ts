import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class DateCustomVariable extends CustomVariable {
    static definitionName = "date";

    protected inputHTML(): string {
        return `<input name="${encode(this.name)}" type="date"></input>`;
    }
}
