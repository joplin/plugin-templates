import { encode } from "html-entities";
import { CustomVariable, InvalidDefinitionError } from "./base";

export class EnumCustomVariable extends CustomVariable {
    static definitionName = "dropdown";
    private options: string[];

    constructor(name: string, label: string, options: string[]) {
        super(name, label);
        this.options = options;
    }

    protected inputHTML(): string {
        const optionsHtml = this.options.map(o => {
            return `<option value="${encode(o)}">${encode(o)}</option>`
        }).join("");
        return `<select name="${encode(this.name)}">${optionsHtml}</select>`;
    }

    private static getOptionsFromType(type: string) {
        type = type.trim();

        if (type.startsWith("dropdown(") && type.endsWith(")")) {
            return type.substr(9, type.length - 10).split(",").map(o => o.trim());
        }

        if (type.startsWith("enum(") && type.endsWith(")")) {
            return type.substr(5, type.length - 6).split(",").map(o => o.trim());
        }

        throw new InvalidDefinitionError();
    }

    static createFromDefinition(name: string, definition: unknown): CustomVariable {
        if (typeof definition === "string") {
            const options = this.getOptionsFromType(definition);
            return new this(name, name, options);
        } else if (typeof definition === "object") {
            if ("type" in definition) {
                const variableType = definition["type"];
                if (typeof variableType === "string") {
                    const options = this.getOptionsFromType(variableType);

                    let label = name;
                    if ("label" in definition && typeof definition["label"] === "string") {
                        label = definition["label"].trim();
                    }

                    return new this(name, label, options);
                }
            }
        }

        throw new InvalidDefinitionError();
    }
}
