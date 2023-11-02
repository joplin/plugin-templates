export enum AttributeValueType {
    Number = "number",
    String = "string",
    Boolean = "boolean",
}

export interface AttributeDefinition {
    name: string;
    valueType: AttributeValueType;
    defaultValue: unknown
}

interface RawAttributes {
    [attr: string]: unknown
}

export interface ParsedAttributes {
    [attr: string]: string | number | boolean
}

export class AttributeParser {
    constructor(private schema: AttributeDefinition[]) {}

    private parseAttribute(attr: AttributeDefinition, rawValue: unknown) {
        switch (attr.valueType) {
            case AttributeValueType.Boolean:
                return !!rawValue;
            case AttributeValueType.Number: {
                const v = typeof rawValue === "string" ? Number.parseFloat(rawValue) : rawValue;
                if (typeof v !== "number" || Number.isNaN(v)) {
                    throw new Error(`Can't convert "${rawValue}" to number while parsing ${attr.name}.`);
                }
                return v;
            }
            case AttributeValueType.String:
                return new String(rawValue).toString();
        }
    }

    parse(rawAttributes: RawAttributes): ParsedAttributes {
        const parsedAttributes = {};

        if (!(typeof rawAttributes === "object")) {
            throw new Error("There was an error parsing attributes.")
        }

        for (const attr of this.schema) {
            if (attr.name in rawAttributes) {
                parsedAttributes[attr.name] = this.parseAttribute(attr, rawAttributes[attr.name]);
            } else {
                parsedAttributes[attr.name] = attr.defaultValue;
            }
        }

        return parsedAttributes;
    }
}
