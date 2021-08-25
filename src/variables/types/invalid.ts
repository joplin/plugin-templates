import { encode } from "html-entities";
import { CustomVariable } from "./base";

export class InvalidCustomVariable extends CustomVariable {
    public toHTML(): string {
        return `<div class="invalidVariable"><i>${encode(this.name)} has an invalid type.</i></div>`;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createFromDefinition(name: string, definition: unknown): CustomVariable {
        return new this(name, name);
    }
}
