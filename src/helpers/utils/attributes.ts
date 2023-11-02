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
    [attr: string]: string
}

export interface ParsedAttributes {
    [attr: string]: string | number | boolean
}

export class AttributeParser {
    constructor(private schema: AttributeDefinition[]) {}

    private parseAttribute(attr: AttributeDefinition, rawValue: string) {
        switch (attr.valueType) {
            case AttributeValueType.Boolean:
                return new Boolean(rawValue);
            case AttributeValueType.Number: {
                const v = Number.parseFloat(rawValue);
                if (Number.isNaN(v)) {
                    throw new Error(`Can't convert "${rawValue}" to number while parsing ${attr.name}.`);
                }
                return v;
            }
            case AttributeValueType.String:
                return new String(rawValue);
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
