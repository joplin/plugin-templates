import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class TimeCustomVariable extends CustomVariable {
    static definitionName = "time";

    protected inputHTML(): string {
        return `<input name="${encode(this.name)}" type="time"></input>`;
    }
}
