import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class TextCustomVariable extends CustomVariable {
    static definitionName = "text";

    protected inputHTML(): string {
        return `<input name="${encode(this.name)}" type="text" aria-label="${encode(this.label)}"></input>`;
    }
}
