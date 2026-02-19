import * as Handlebars from "handlebars/dist/handlebars";

import { DateAndTimeUtils } from "@templates/utils/dateAndTime";
import { HelperFactory } from "@templates/helpers/index";

describe("Handlebars Helpers", () => {
    beforeAll(() => {
        const dateAndTimeUtils = new DateAndTimeUtils("en", "DD/MM/YYYY", "HH:mm");
        HelperFactory.registerHelpers(dateAndTimeUtils);
    });

    // ─────────────────────────────────────────────
    // Compare Helper
    // ─────────────────────────────────────────────
    describe("compare helper", () => {
        test("should support == operator", () => {
            const template = Handlebars.compile('{{#if (compare a "==" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 5, b: 5 })).toEqual("yes");
            expect(template({ a: 5, b: 6 })).toEqual("no");
        });

        test("should support == with type coercion", () => {
            const template = Handlebars.compile('{{#if (compare a "==" b)}}yes{{else}}no{{/if}}');
            // eslint-disable-next-line eqeqeq
            expect(template({ a: 5, b: "5" })).toEqual("yes");
        });

        test("should support === operator", () => {
            const template = Handlebars.compile('{{#if (compare a "===" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 5, b: 5 })).toEqual("yes");
            expect(template({ a: 5, b: "5" })).toEqual("no");
        });

        test("should support != operator", () => {
            const template = Handlebars.compile('{{#if (compare a "!=" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 5, b: 6 })).toEqual("yes");
            expect(template({ a: 5, b: 5 })).toEqual("no");
        });

        test("should support !== operator", () => {
            const template = Handlebars.compile('{{#if (compare a "!==" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 5, b: "5" })).toEqual("yes");
            expect(template({ a: 5, b: 5 })).toEqual("no");
        });

        test("should support < operator", () => {
            const template = Handlebars.compile('{{#if (compare a "<" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 3, b: 5 })).toEqual("yes");
            expect(template({ a: 5, b: 3 })).toEqual("no");
            expect(template({ a: 5, b: 5 })).toEqual("no");
        });

        test("should support <= operator", () => {
            const template = Handlebars.compile('{{#if (compare a "<=" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 3, b: 5 })).toEqual("yes");
            expect(template({ a: 5, b: 5 })).toEqual("yes");
            expect(template({ a: 6, b: 5 })).toEqual("no");
        });

        test("should support > operator", () => {
            const template = Handlebars.compile('{{#if (compare a ">" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 5, b: 3 })).toEqual("yes");
            expect(template({ a: 3, b: 5 })).toEqual("no");
        });

        test("should support >= operator", () => {
            const template = Handlebars.compile('{{#if (compare a ">=" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: 5, b: 3 })).toEqual("yes");
            expect(template({ a: 5, b: 5 })).toEqual("yes");
            expect(template({ a: 3, b: 5 })).toEqual("no");
        });

        test("should support named aliases (eq, ne, lt, lte, gt, gte)", () => {
            expect(Handlebars.compile('{{#if (compare a "eq" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "equals" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "seq" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "strictly-equals" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "ne" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 2 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "not-equals" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 2 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "sne" b)}}yes{{else}}no{{/if}}')({ a: 1, b: "1" })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "strictly-not-equals" b)}}yes{{else}}no{{/if}}')({ a: 1, b: "1" })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "lt" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 2 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "less-than" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 2 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "lte" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "less-than-equals" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "gt" b)}}yes{{else}}no{{/if}}')({ a: 2, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "greater-than" b)}}yes{{else}}no{{/if}}')({ a: 2, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "gte" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
            expect(Handlebars.compile('{{#if (compare a "greater-than-equals" b)}}yes{{else}}no{{/if}}')({ a: 1, b: 1 })).toEqual("yes");
        });

        test("should throw on invalid operator", () => {
            const template = Handlebars.compile('{{#if (compare a "invalid" b)}}yes{{/if}}');
            expect(() => template({ a: 1, b: 1 })).toThrow("Invalid comparison operator");
        });

        test("should compare strings lexicographically", () => {
            const template = Handlebars.compile('{{#if (compare a "<" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: "apple", b: "banana" })).toEqual("yes");
            expect(template({ a: "banana", b: "apple" })).toEqual("no");
        });

        test("should handle null and undefined values", () => {
            const template = Handlebars.compile('{{#if (compare a "==" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: null, b: null })).toEqual("yes");
            expect(template({ a: null, b: undefined })).toEqual("yes");
        });
    });

    // ─────────────────────────────────────────────
    // Condition Helper
    // ─────────────────────────────────────────────
    describe("condition helper", () => {
        test("should support && (and) operator", () => {
            const template = Handlebars.compile('{{#if (condition a "&&" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: true, b: true })).toEqual("yes");
            expect(template({ a: true, b: false })).toEqual("no");
            expect(template({ a: false, b: true })).toEqual("no");
            expect(template({ a: false, b: false })).toEqual("no");
        });

        test("should support 'and' alias", () => {
            const template = Handlebars.compile('{{#if (condition a "and" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: true, b: true })).toEqual("yes");
            expect(template({ a: true, b: false })).toEqual("no");
        });

        test("should support || (or) operator", () => {
            const template = Handlebars.compile('{{#if (condition a "||" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: true, b: false })).toEqual("yes");
            expect(template({ a: false, b: true })).toEqual("yes");
            expect(template({ a: false, b: false })).toEqual("no");
        });

        test("should support 'or' alias", () => {
            const template = Handlebars.compile('{{#if (condition a "or" b)}}yes{{else}}no{{/if}}');
            expect(template({ a: false, b: true })).toEqual("yes");
            expect(template({ a: false, b: false })).toEqual("no");
        });

        test("should support ! (not) operator", () => {
            const template = Handlebars.compile('{{#if (condition a "!")}}yes{{else}}no{{/if}}');
            expect(template({ a: false })).toEqual("yes");
            expect(template({ a: true })).toEqual("no");
        });

        test("should support 'not' alias", () => {
            const template = Handlebars.compile('{{#if (condition a "not")}}yes{{else}}no{{/if}}');
            expect(template({ a: false })).toEqual("yes");
            expect(template({ a: true })).toEqual("no");
        });

        test("should throw on invalid operator", () => {
            const template = Handlebars.compile('{{#if (condition a "xor" b)}}yes{{/if}}');
            expect(() => template({ a: true, b: true })).toThrow("Invalid operator");
        });

        test("should handle truthy and falsy values (not just booleans)", () => {
            const andTemplate = Handlebars.compile('{{#if (condition a "&&" b)}}yes{{else}}no{{/if}}');
            expect(andTemplate({ a: 1, b: "hello" })).toEqual("yes");
            expect(andTemplate({ a: 0, b: "hello" })).toEqual("no");
            expect(andTemplate({ a: "", b: 1 })).toEqual("no");

            const notTemplate = Handlebars.compile('{{#if (condition a "!")}}yes{{else}}no{{/if}}');
            expect(notTemplate({ a: 0 })).toEqual("yes");
            expect(notTemplate({ a: "" })).toEqual("yes");
            expect(notTemplate({ a: 1 })).toEqual("no");
        });

        test("should work combined with compare helper", () => {
            const template = Handlebars.compile('{{#if (condition (compare a ">" 10) "&&" (compare b "<" 5))}}yes{{else}}no{{/if}}');
            expect(template({ a: 15, b: 3 })).toEqual("yes");
            expect(template({ a: 15, b: 10 })).toEqual("no");
            expect(template({ a: 5, b: 3 })).toEqual("no");
        });
    });

    // ─────────────────────────────────────────────
    // Math Helper
    // ─────────────────────────────────────────────
    describe("math helper", () => {
        test("should support addition", () => {
            const template = Handlebars.compile('{{math a "+" b}}');
            expect(template({ a: 3, b: 5 })).toEqual("8");
        });

        test("should support subtraction", () => {
            const template = Handlebars.compile('{{math a "-" b}}');
            expect(template({ a: 10, b: 4 })).toEqual("6");
        });

        test("should support multiplication", () => {
            const template = Handlebars.compile('{{math a "*" b}}');
            expect(template({ a: 3, b: 7 })).toEqual("21");
        });

        test("should support division", () => {
            const template = Handlebars.compile('{{math a "/" b}}');
            expect(template({ a: 20, b: 4 })).toEqual("5");
        });

        test("should support exponentiation", () => {
            const template = Handlebars.compile('{{math a "**" b}}');
            expect(template({ a: 2, b: 3 })).toEqual("8");
        });

        test("should support modulo", () => {
            const template = Handlebars.compile('{{math a "%" b}}');
            expect(template({ a: 10, b: 3 })).toEqual("1");
        });

        test("should throw on modulo by zero", () => {
            const template = Handlebars.compile('{{math a "%" b}}');
            expect(() => template({ a: 10, b: 0 })).toThrow("% operator used with 0");
        });

        test("should handle floating point numbers", () => {
            const template = Handlebars.compile('{{math a "+" b}}');
            expect(template({ a: 1.5, b: 2.3 })).toEqual("3.8");
        });

        test("should handle negative numbers", () => {
            const template = Handlebars.compile('{{math a "+" b}}');
            expect(template({ a: -5, b: 3 })).toEqual("-2");
        });

        test("should throw on non-numeric inputs", () => {
            const template = Handlebars.compile('{{math a "+" b}}');
            expect(() => template({ a: "abc", b: 3 })).toThrow("Can't convert");
        });

        test("should throw on invalid operator", () => {
            const template = Handlebars.compile('{{math a "^" b}}');
            expect(() => template({ a: 2, b: 3 })).toThrow("Invalid operator");
        });

        test("should support nested math operations", () => {
            const template = Handlebars.compile('{{math (math a "+" b) "*" c}}');
            expect(template({ a: 2, b: 3, c: 4 })).toEqual("20");
        });

        test("should return Infinity for division by zero", () => {
            const template = Handlebars.compile('{{math a "/" b}}');
            expect(template({ a: 10, b: 0 })).toEqual("Infinity");
        });

        test("should parse string numbers correctly", () => {
            const template = Handlebars.compile('{{math a "+" b}}');
            expect(template({ a: "5", b: "3" })).toEqual("8");
        });
    });

    // ─────────────────────────────────────────────
    // Case Helper
    // ─────────────────────────────────────────────
    describe("case helper", () => {
        test("should convert to uppercase", () => {
            const template = Handlebars.compile('{{case "upper" text}}');
            expect(template({ text: "hello world" })).toEqual("HELLO WORLD");
        });

        test("should convert to lowercase", () => {
            const template = Handlebars.compile('{{case "lower" text}}');
            expect(template({ text: "HELLO WORLD" })).toEqual("hello world");
        });

        test("should handle mixed case input for upper", () => {
            const template = Handlebars.compile('{{case "upper" text}}');
            expect(template({ text: "Hello World" })).toEqual("HELLO WORLD");
        });

        test("should handle mixed case input for lower", () => {
            const template = Handlebars.compile('{{case "lower" text}}');
            expect(template({ text: "Hello World" })).toEqual("hello world");
        });

        test("should handle empty string", () => {
            const template = Handlebars.compile('{{case "upper" text}}');
            expect(template({ text: "" })).toEqual("");
        });

        test("should handle numbers as input", () => {
            const template = Handlebars.compile('{{case "upper" text}}');
            expect(template({ text: 123 })).toEqual("123");
        });

        test("should throw on invalid case type", () => {
            const template = Handlebars.compile('{{case "title" text}}');
            expect(() => template({ text: "hello" })).toThrow("Invalid case type");
        });
    });

    // ─────────────────────────────────────────────
    // Repeat Helper
    // ─────────────────────────────────────────────
    describe("repeat helper", () => {
        test("should repeat content n times", () => {
            const template = Handlebars.compile("{{#repeat 3}}item\n{{/repeat}}");
            expect(template({})).toEqual("item\nitem\nitem\n");
        });

        test("should provide repeat_index variable", () => {
            const template = Handlebars.compile("{{#repeat 3}}{{repeat_index}}\n{{/repeat}}");
            expect(template({})).toEqual("0\n1\n2\n");
        });

        test("should work with math helper for 1-based index", () => {
            const template = Handlebars.compile('{{#repeat 3}}{{math repeat_index "+" 1}}\n{{/repeat}}');
            expect(template({})).toEqual("1\n2\n3\n");
        });

        test("should repeat zero times for count of 0", () => {
            const template = Handlebars.compile("{{#repeat 0}}item\n{{/repeat}}");
            expect(template({})).toEqual("");
        });

        test("should work with dynamic count from context", () => {
            const template = Handlebars.compile("{{#repeat count}}x{{/repeat}}");
            expect(template({ count: 4 })).toEqual("xxxx");
        });

        test("should throw on non-numeric input", () => {
            const template = Handlebars.compile("{{#repeat count}}item{{/repeat}}");
            expect(() => template({ count: "abc" })).toThrow("Can't convert");
        });

        test("should preserve outer context variables", () => {
            const template = Handlebars.compile("{{#repeat 2}}{{name}}-{{repeat_index}} {{/repeat}}");
            expect(template({ name: "test" })).toEqual("test-0 test-1 ");
        });

        test("should handle negative count by producing no output", () => {
            const template = Handlebars.compile("{{#repeat count}}item{{/repeat}}");
            expect(template({ count: -1 })).toEqual("");
        });

        test("should repeat exactly once for count of 1", () => {
            const template = Handlebars.compile("{{#repeat 1}}only{{/repeat}}");
            expect(template({})).toEqual("only");
        });
    });
});
