import { AttributeParser, AttributeDefinition, AttributeValueType } from "@templates/helpers/utils/attributes";

describe("Attribute parser", () => {
    test("should be able to set default values", () => {
        const schema: AttributeDefinition[] = [
            {
                name: "v1",
                valueType: AttributeValueType.String,
                defaultValue: "s1"
            },
            {
                name: "v2",
                valueType: AttributeValueType.String,
                defaultValue: "s2"
            },
            {
                name: "v3",
                valueType: AttributeValueType.Number,
                defaultValue: 3
            },
            {
                name: "v4",
                valueType: AttributeValueType.Boolean,
                defaultValue: false
            }
        ];

        const attrs = new AttributeParser(schema).parse({
            v5: "test1",
            v2: "test2"
        });

        expect(attrs.v1).toEqual("s1");
        expect(attrs.v2).toEqual("test2");
        expect(attrs.v3).toEqual(3);
        expect(attrs.v4).toEqual(false);
    });

    test("should be able to parse string values", () => {
        const schema: AttributeDefinition[] = [
            {
                name: "v1",
                valueType: AttributeValueType.String,
                defaultValue: "s1"
            },
            {
                name: "v2",
                valueType: AttributeValueType.String,
                defaultValue: "s2"
            },
            {
                name: "v3",
                valueType: AttributeValueType.String,
                defaultValue: "s3"
            },
            {
                name: "v4",
                valueType: AttributeValueType.String,
                defaultValue: "s4"
            }
        ];

        const attrs = new AttributeParser(schema).parse({
            v1: "test1",
            v2: 123456789,
            v3: false,
        });

        expect(attrs.v1).toEqual("test1");
        expect(attrs.v2).toEqual("123456789");
        expect(attrs.v3).toEqual("false");
        expect(attrs.v4).toEqual("s4");
    });

    test("should be able to parse number values", () => {
        const schema: AttributeDefinition[] = [
            {
                name: "v1",
                valueType: AttributeValueType.Number,
                defaultValue: 1
            },
            {
                name: "v2",
                valueType: AttributeValueType.Number,
                defaultValue: 2
            },
            {
                name: "v3",
                valueType: AttributeValueType.Number,
                defaultValue: 3
            },
        ];

        const attrs = new AttributeParser(schema).parse({
            v1: "123456789",
            v2: 987654321,
        });

        expect(attrs.v1).toEqual(123456789);
        expect(attrs.v2).toEqual(987654321);
        expect(attrs.v3).toEqual(3);
    });

    test("should throw error when can't parse number values", () => {
        const schema: AttributeDefinition[] = [
            {
                name: "v1",
                valueType: AttributeValueType.Number,
                defaultValue: 1
            },
        ];

        const parser = new AttributeParser(schema);

        expect(() => parser.parse({ v1: "abcd" })).toThrow();
        expect(() => parser.parse({ v1: false })).toThrow();
        expect(() => parser.parse({ v1: "123" })).not.toThrow();
        expect(() => parser.parse({ v1: 123 })).not.toThrow();
    });

    test("should be able to parse boolean values", () => {
        const schema: AttributeDefinition[] = [
            {
                name: "v1",
                valueType: AttributeValueType.Boolean,
                defaultValue: true
            },
            {
                name: "v2",
                valueType: AttributeValueType.Boolean,
                defaultValue: true
            },
            {
                name: "v3",
                valueType: AttributeValueType.Boolean,
                defaultValue: false
            },
            {
                name: "v4",
                valueType: AttributeValueType.Boolean,
                defaultValue: false
            },
            {
                name: "v5",
                valueType: AttributeValueType.Boolean,
                defaultValue: false
            },
        ];

        const attrs = new AttributeParser(schema).parse({
            v1: "",
            v2: 0,
            v3: 5,
            v4: false,
        });

        expect(attrs.v1).toEqual(false);
        expect(attrs.v2).toEqual(false);
        expect(attrs.v3).toEqual(true);
        expect(attrs.v4).toEqual(false);
        expect(attrs.v5).toEqual(false);
    });
});
