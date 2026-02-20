import joplin from "api";
import * as tagUtils from "@templates/utils/tags";
import * as folderUtils from "@templates/utils/folders";
import { getUserTemplateSelection } from "@templates/utils/templates";
import { TemplatesSourceSetting, TemplatesSource } from "@templates/settings/templatesSource";
import { encode } from "html-entities";

interface TagData {
    id: string;
    title: string;
    notes: {
        id: string;
        title: string;
        body: string;
    }[];
}

let dialogHandle: string;

beforeEach(async () => {
    dialogHandle = await joplin.views.dialogs.create("templateSelector");
});

// Helper functions for common test setup
const mockJoplinSettings = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async (message: string) => {
        return 0;
    });

    jest.spyOn(joplin.settings, "globalValue").mockImplementation(async (setting: string) => {
        if (setting === "locale") {
            return "en_GB";
        }
    });
};

const mockTemplateSourceSetting = (source: TemplatesSource) => {
    jest.spyOn(TemplatesSourceSetting, "get").mockImplementation(async () => {
        return source;
    });
};

const expectTemplatesDialog = (selectedTemplateValue: string | null) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jest.spyOn(joplin.views.dialogs, "open").mockImplementation(async (handle: string) => {
        if (selectedTemplateValue === null) {
            return { id: "cancel" };
        }
        return {
            id: "ok",
            formData: {
                "templates-form": {
                    template: selectedTemplateValue
                }
            }
        };
    });
};

const setTemplateTagsAndNotes = (data: TagData[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jest.spyOn(tagUtils, "getAllTagsWithTitle").mockImplementation(async (title: string) => {
        return data.map(tag => {
            return {
                id: tag.id,
                title: tag.title
            }
        });
    });

    jest.spyOn(tagUtils, "getAllNotesWithTag").mockImplementation(async (id: string) => {
        for (const tag of data) {
            if (tag.id === id) {
                return tag.notes;
            }
        }
        return [];
    });
};

const setNotebookTemplates = (notes: { id: string; title: string; body: string; }[]) => {
    jest.spyOn(folderUtils, "getAllNotesInFolder").mockImplementation(async (title: string) => {
        if (title === "Templates") {
            return notes;
        }
        return [];
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const testExpectedCalls = (mockedFunction: any, expectedCalls: number): void => {
    expect(mockedFunction.mock.calls.length).toBe(expectedCalls);
};

describe("Get user template selection", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockJoplinSettings();
        mockTemplateSourceSetting(TemplatesSource.Tag);
    });

    test("should show a dialog when there are no templates", async () => {
        setTemplateTagsAndNotes([]);
        const selectedTemplate = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.views.dialogs.showMessageBox, 1);
        expect(selectedTemplate).toBeNull();
    });

    test("should show a dialog when there's a template tag with no notes", async () => {
        setTemplateTagsAndNotes([
            {
                id: "tag-id-1",
                title: "template",
                notes: []
            }
        ]);
        const selectedTemplate = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.views.dialogs.showMessageBox, 1);
        expect(selectedTemplate).toBeNull();
    });

    test("should show selector correctly when there's one tag", async () => {
        setTemplateTagsAndNotes([
            {
                id: "tag-id-1",
                title: "template",
                notes: [
                    {
                        id: "note-id-1",
                        title: "Template 1",
                        body: "Template Body"
                    },
                    {
                        id: "note-id-2",
                        title: "Template 2",
                        body: "Template Body"
                    }
                ]
            }
        ]);

        const selectedNote = {
            id: "note-id-1",
            title: "Template 1",
            body: "Template Body"
        };
        const selectedTemplateValue = encode(JSON.stringify(selectedNote));

        expectTemplatesDialog(selectedTemplateValue);
        const res = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.views.dialogs.open, 1);
        expect(res).toEqual(JSON.stringify(selectedNote));
    });

    test("should show selector correctly when there are multiple template tags", async () => {
        setTemplateTagsAndNotes([
            {
                id: "tag-id-1",
                title: "template",
                notes: [
                    {
                        id: "note-id-2",
                        title: "Template 2",
                        body: "Template Body"
                    },
                    {
                        id: "note-id-1",
                        title: "Template 1",
                        body: "Template Body"
                    }
                ]
            },
            {
                id: "tag-id-2",
                title: "template",
                notes: [
                    {
                        id: "note-id-2",
                        title: "Template 2",
                        body: "Template Body"
                    },
                    {
                        id: "note-id-3",
                        title: "Template 3",
                        body: "Template Body"
                    }
                ]
            }
        ]);

        const selectedNote = {
            id: "note-id-2",
            title: "Template 2",
            body: "Template Body"
        };
        const selectedTemplateValue = encode(JSON.stringify(selectedNote));

        expectTemplatesDialog(selectedTemplateValue);
        const res = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.views.dialogs.open, 1);
        expect(res).toEqual(JSON.stringify(selectedNote));
    });

    test("should return null if no template is selected", async () => {
        setTemplateTagsAndNotes([
            {
                id: "tag-id-1",
                title: "template",
                notes: [
                    {
                        id: "note-id-1",
                        title: "Template 1",
                        body: "Template Body"
                    },
                    {
                        id: "note-id-2",
                        title: "Template 2",
                        body: "Template Body"
                    }
                ]
            }
        ]);

        expectTemplatesDialog(null);
        const res = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.views.dialogs.open, 1);
        expect(res).toBeNull();
    });

    test("should return a single property if noteProperty is defined", async () => {
        setTemplateTagsAndNotes([
            {
                id: "tag-id-1",
                title: "template",
                notes: [
                    {
                        id: "note-id-1",
                        title: "Template 1",
                        body: "Template Body"
                    },
                    {
                        id: "note-id-2",
                        title: "Template 2",
                        body: "Template Body"
                    }
                ]
            }
        ]);

        const selectedTemplateValue = encode("Template Body");

        expectTemplatesDialog(selectedTemplateValue);
        const res = await getUserTemplateSelection(dialogHandle, "body");
        testExpectedCalls(joplin.views.dialogs.open, 1);
        expect(res).toEqual("Template Body");
    });

    test("should sort the templates correctly", async () => {
        setTemplateTagsAndNotes([
            {
                id: "tag-id-1",
                title: "template",
                notes: [
                    {
                        id: "note-id-1",
                        title: "Template 1",
                        body: "Template Body"
                    },
                    {
                        id: "note-id-10",
                        title: "Template 10",
                        body: "Template Body"
                    },
                    {
                        id: "note-id-2",
                        title: "Template 2",
                        body: "Template Body"
                    }
                ]
            }
        ]);

        expectTemplatesDialog(null);
        const res = await getUserTemplateSelection(dialogHandle, "body");
        testExpectedCalls(joplin.views.dialogs.open, 1);
        expect(res).toEqual(null);
    });

    describe("Custom template ordering", () => {
        test("should sort templates by custom order when order metadata is present", async () => {
            setTemplateTagsAndNotes([
                {
                    id: "tag-id-1",
                    title: "template",
                    notes: [
                        {
                            id: "note-id-1",
                            title: "Template C",
                            body: "---\norder: 3\n---\nTemplate Body C"
                        },
                        {
                            id: "note-id-2",
                            title: "Template A",
                            body: "---\norder: 1\n---\nTemplate Body A"
                        },
                        {
                            id: "note-id-3",
                            title: "Template B",
                            body: "---\norder: 2\n---\nTemplate Body B"
                        }
                    ]
                }
            ]);

            // Mock the dialog to capture the HTML content to verify order
            let capturedHtml = "";
            jest.spyOn(joplin.views.dialogs, "setHtml").mockImplementation(async (handle: string, html: string) => {
                capturedHtml = html;
                return "";
            });

            expectTemplatesDialog(null);
            await getUserTemplateSelection(dialogHandle);

            // Verify that templates appear in custom order (A, B, C) not alphabetical (A, B, C happens to be same)
            // Let's check the order by looking at the option values in the HTML
            const optionMatches = capturedHtml.match(/<option[^>]*>([^<]+)<\/option>/g);
            expect(optionMatches).toBeDefined();
            if (optionMatches) {
                const titles = optionMatches.map(option => {
                    const match = option.match(/>([^<]+)</);
                    return match ? match[1] : "";
                });
                expect(titles).toEqual(["Template A", "Template B", "Template C"]);
            }
        });

        test("should prioritize templates with order over those without", async () => {
            setTemplateTagsAndNotes([
                {
                    id: "tag-id-1",
                    title: "template",
                    notes: [
                        {
                            id: "note-id-1",
                            title: "Template Z",
                            body: "Template Body Z (no order)"
                        },
                        {
                            id: "note-id-2",
                            title: "Template A",
                            body: "---\norder: 1\n---\nTemplate Body A"
                        },
                        {
                            id: "note-id-3",
                            title: "Template B",
                            body: "Template Body B (no order)"
                        }
                    ]
                }
            ]);

            let capturedHtml = "";
            jest.spyOn(joplin.views.dialogs, "setHtml").mockImplementation(async (handle: string, html: string) => {
                capturedHtml = html;
                return "";
            });

            expectTemplatesDialog(null);
            await getUserTemplateSelection(dialogHandle);

            const optionMatches = capturedHtml.match(/<option[^>]*>([^<]+)<\/option>/g);
            expect(optionMatches).toBeDefined();
            if (optionMatches) {
                const titles = optionMatches.map(option => {
                    const match = option.match(/>([^<]+)</);
                    return match ? match[1] : "";
                });
                // Template A (with order: 1) should come first, then B and Z alphabetically
                expect(titles).toEqual(["Template A", "Template B", "Template Z"]);
            }
        });

        test("should fallback to alphabetical sorting when templates have same order", async () => {
            setTemplateTagsAndNotes([
                {
                    id: "tag-id-1",
                    title: "template",
                    notes: [
                        {
                            id: "note-id-1",
                            title: "Template Z",
                            body: "---\norder: 1\n---\nTemplate Body Z"
                        },
                        {
                            id: "note-id-2",
                            title: "Template A",
                            body: "---\norder: 1\n---\nTemplate Body A"
                        },
                        {
                            id: "note-id-3",
                            title: "Template M",
                            body: "---\norder: 1\n---\nTemplate Body M"
                        }
                    ]
                }
            ]);

            let capturedHtml = "";
            jest.spyOn(joplin.views.dialogs, "setHtml").mockImplementation(async (handle: string, html: string) => {
                capturedHtml = html;
                return "";
            });

            expectTemplatesDialog(null);
            await getUserTemplateSelection(dialogHandle);

            const optionMatches = capturedHtml.match(/<option[^>]*>([^<]+)<\/option>/g);
            expect(optionMatches).toBeDefined();
            if (optionMatches) {
                const titles = optionMatches.map(option => {
                    const match = option.match(/>([^<]+)</);
                    return match ? match[1] : "";
                });
                // All have same order, so should be alphabetical: A, M, Z
                expect(titles).toEqual(["Template A", "Template M", "Template Z"]);
            }
        });

        test("should handle invalid order values gracefully", async () => {
            setTemplateTagsAndNotes([
                {
                    id: "tag-id-1",
                    title: "template",
                    notes: [
                        {
                            id: "note-id-1",
                            title: "Template C",
                            body: "---\norder: invalid\n---\nTemplate Body C"
                        },
                        {
                            id: "note-id-2",
                            title: "Template A",
                            body: "---\norder: 1\n---\nTemplate Body A"
                        },
                        {
                            id: "note-id-3",
                            title: "Template B",
                            body: "Template Body B (no order)"
                        }
                    ]
                }
            ]);

            let capturedHtml = "";
            jest.spyOn(joplin.views.dialogs, "setHtml").mockImplementation(async (handle: string, html: string) => {
                capturedHtml = html;
                return "";
            });

            expectTemplatesDialog(null);
            await getUserTemplateSelection(dialogHandle);

            const optionMatches = capturedHtml.match(/<option[^>]*>([^<]+)<\/option>/g);
            expect(optionMatches).toBeDefined();
            if (optionMatches) {
                const titles = optionMatches.map(option => {
                    const match = option.match(/>([^<]+)</);
                    return match ? match[1] : "";
                });
                // Template A (valid order) first, then B and C alphabetically
                expect(titles).toEqual(["Template A", "Template B", "Template C"]);
            }
        });

        test("should handle malformed front-matter gracefully", async () => {
            setTemplateTagsAndNotes([
                {
                    id: "tag-id-1",
                    title: "template",
                    notes: [
                        {
                            id: "note-id-1",
                            title: "Template C",
                            body: "---\nmalformed yaml: [\n---\nTemplate Body C"
                        },
                        {
                            id: "note-id-2",
                            title: "Template A",
                            body: "---\norder: 1\n---\nTemplate Body A"
                        },
                        {
                            id: "note-id-3",
                            title: "Template B",
                            body: "Template Body B (no front-matter)"
                        }
                    ]
                }
            ]);

            let capturedHtml = "";
            jest.spyOn(joplin.views.dialogs, "setHtml").mockImplementation(async (handle: string, html: string) => {
                capturedHtml = html;
                return "";
            });

            expectTemplatesDialog(null);
            await getUserTemplateSelection(dialogHandle);

            const optionMatches = capturedHtml.match(/<option[^>]*>([^<]+)<\/option>/g);
            expect(optionMatches).toBeDefined();
            if (optionMatches) {
                const titles = optionMatches.map(option => {
                    const match = option.match(/>([^<]+)</);
                    return match ? match[1] : "";
                });
                // Template A (valid order) first, then B and C alphabetically
                expect(titles).toEqual(["Template A", "Template B", "Template C"]);
            }
        });

        test("should work with notebook-based templates", async () => {
            mockTemplateSourceSetting(TemplatesSource.Notebook);
            
            setNotebookTemplates([
                {
                    id: "note-id-1",
                    title: "Template C",
                    body: "---\norder: 3\n---\nTemplate Body C"
                },
                {
                    id: "note-id-2",
                    title: "Template A",
                    body: "---\norder: 1\n---\nTemplate Body A"
                },
                {
                    id: "note-id-3",
                    title: "Template B",
                    body: "---\norder: 2\n---\nTemplate Body B"
                }
            ]);

            let capturedHtml = "";
            jest.spyOn(joplin.views.dialogs, "setHtml").mockImplementation(async (handle: string, html: string) => {
                capturedHtml = html;
                return "";
            });

            expectTemplatesDialog(null);
            await getUserTemplateSelection(dialogHandle);

            const optionMatches = capturedHtml.match(/<option[^>]*>([^<]+)<\/option>/g);
            expect(optionMatches).toBeDefined();
            if (optionMatches) {
                const titles = optionMatches.map(option => {
                    const match = option.match(/>([^<]+)</);
                    return match ? match[1] : "";
                });
                expect(titles).toEqual(["Template A", "Template B", "Template C"]);
            }
        });
    });
});
