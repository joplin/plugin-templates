import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { encode } from "html-entities";

export class InvalidDefinitionError extends Error { }

export class CustomVariable {
    static definitionName: string;
    protected label: string;
    protected name: string;
    protected rawDefault: string | boolean | number | null;

    constructor(name: string, label: string, rawDefault: string | boolean | number | null = null) {
        this.name = name;
        this.label = label;
        this.rawDefault = rawDefault;
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
            return new this(name, name, null);
        } else if (typeof definition === "object" && definition !== null) {
            if ("type" in definition) {
                const definitionObj = definition as Record<string, unknown>;
                const variableType = definitionObj["type"];
                if (typeof variableType === "string" && variableType.trim() === this.definitionName) {
                    let label = name;
                    if ("label" in definitionObj && typeof definitionObj["label"] === "string") {
                        label = definitionObj["label"].trim();
                    }

                    let rawDefault: string | boolean | number | null = null;
                    if ("default" in definitionObj) {
                        const value = definitionObj["default"];

                        if (
                            typeof value === "string" ||
                            typeof value === "boolean" ||
                            typeof value === "number" ||
                            value === null
                        ) {
                            rawDefault = value;
                        } else {
                            throw new InvalidDefinitionError("Unsupported default value type");
                        }
                    }

                    return new this(name, label, rawDefault);
                }
            }
        }

        throw new InvalidDefinitionError();
    }
}
