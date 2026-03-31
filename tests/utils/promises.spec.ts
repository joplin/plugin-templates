import { resolveNamedPromises } from "@templates/utils/promises";

describe("resolveNamedPromises", () => {
    test("should resolve named promises while preserving keys", async () => {
        const resolvedPromises = await resolveNamedPromises({
            title: Promise.resolve("Template"),
            noteCount: Promise.resolve(3),
        });

        expect(resolvedPromises).toEqual({
            title: "Template",
            noteCount: 3,
        });
    });

    test("should resolve an empty object", async () => {
        await expect(resolveNamedPromises({})).resolves.toEqual({});
    });

    test("should reject when one of the promises rejects", async () => {
        await expect(resolveNamedPromises({
            success: Promise.resolve("ok"),
            failure: Promise.reject(new Error("boom")),
        })).rejects.toThrow("boom");
    });
});
