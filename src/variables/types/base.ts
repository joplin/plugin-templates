import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";

export class InvalidDefinitionError extends Error {}

export class CustomVariable {
    static definitionName: string;
    protected label: string;
    protected name: string;

    constructor(name: string, label: string) {
        this.name = name;
        this.label = label;
    }

    protected inputHTML(): string {
        return "";
    }

    public toHTML(): string {
        return (
            `
            <div class="variableInput">
                <div class="variableName">
                    ${encode(this.label)}
                </div>
                <div>
                    ${this.inputHTML()}
                </div>
            </div>
            `
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    public processInput(input: string, dateAndTimeUtils: DateAndTimeUtils): any {
        return input;
    }

    static createFromDefinition(name: string, definition: unknown): CustomVariable {
        if (typeof definition === "string" && definition.trim() === this.definitionName) {
            return new this(name, name);
        } else if (typeof definition === "object") {
            if ("type" in definition) {
                const variableType = definition["type"];
                if (typeof variableType === "string" && variableType.trim() === this.definitionName) {
                    let label = name;
                    if ("label" in definition && typeof definition["label"] === "string") {
                        label = definition["label"].trim();
                    }
                    return new this(name, label);
                }
            }
        }

        throw new InvalidDefinitionError();
    }
}
