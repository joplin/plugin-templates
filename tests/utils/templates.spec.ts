import joplin from "api";
import * as tagUtils from "@templates/utils/tags";
import { getUserTemplateSelection } from "@templates/utils/templates";

interface DropdownOption {
    label: string;
    value: string;
}

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

describe("Get user template selection", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jest.spyOn(joplin.views.dialogs, "showMessageBox").mockImplementation(async (message: string) => {
        return 0;
    });

    jest.spyOn(joplin.settings, "globalValue").mockImplementation(async (setting: string) => {
        if (setting === "locale") {
            return "en_GB";
        }
    });

    jest.spyOn(joplin.settings, "value").mockImplementation(async (setting: string) => {
        if (setting === "templatesSource") {
            return "tag";
        }
    });

    const expectTemplatesSelector = (templates: DropdownOption[], selectedValue: DropdownOption | null) => {
        jest.spyOn(joplin.commands, "execute").mockImplementation(async (cmd: string, props: Record<string, unknown>) => {
            expect(cmd).toEqual("showPrompt");
            expect(props.autocomplete).toEqual(templates);
            return {
                answer: selectedValue
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
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testExpectedCalls = (mockedFunction: any, expectedCalls: number): void => {
        expect(mockedFunction.mock.calls.length).toBe(expectedCalls);
    }

    beforeEach(() => {
        jest.clearAllMocks();
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

        const templateOptions = [
            {
                label: "Template 1",
                value: JSON.stringify({
                    id: "note-id-1",
                    title: "Template 1",
                    body: "Template Body"
                })
            },
            {
                label: "Template 2",
                value: JSON.stringify({
                    id: "note-id-2",
                    title: "Template 2",
                    body: "Template Body"
                })
            }
        ];
        const selectedTemplate = templateOptions[0];

        expectTemplatesSelector(templateOptions, selectedTemplate);
        const res = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.commands.execute, 1);
        expect(res).toEqual(selectedTemplate.value);
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

        const templateOptions = [
            {
                label: "Template 1",
                value: JSON.stringify({
                    id: "note-id-1",
                    title: "Template 1",
                    body: "Template Body"
                })
            },
            {
                label: "Template 2",
                value: JSON.stringify({
                    id: "note-id-2",
                    title: "Template 2",
                    body: "Template Body"
                })
            },
            {
                label: "Template 3",
                value: JSON.stringify({
                    id: "note-id-3",
                    title: "Template 3",
                    body: "Template Body"
                })
            },
        ];
        const selectedTemplate = templateOptions[1];

        expectTemplatesSelector(templateOptions, selectedTemplate);
        const res = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.commands.execute, 1);
        expect(res).toEqual(selectedTemplate.value);
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

        const templateOptions = [
            {
                label: "Template 1",
                value: JSON.stringify({
                    id: "note-id-1",
                    title: "Template 1",
                    body: "Template Body"
                })
            },
            {
                label: "Template 2",
                value: JSON.stringify({
                    id: "note-id-2",
                    title: "Template 2",
                    body: "Template Body"
                })
            }
        ];
        const selectedTemplate = null;

        expectTemplatesSelector(templateOptions, selectedTemplate);
        const res = await getUserTemplateSelection(dialogHandle);
        testExpectedCalls(joplin.commands.execute, 1);
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

        const templateOptions = [
            {
                label: "Template 1",
                value: "Template Body"
            },
            {
                label: "Template 2",
                value: "Template Body"
            }
        ];
        const selectedTemplate = templateOptions[1];

        expectTemplatesSelector(templateOptions, selectedTemplate);
        const res = await getUserTemplateSelection(dialogHandle, "body");
        testExpectedCalls(joplin.commands.execute, 1);
        expect(res).toEqual(selectedTemplate.value);
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

        const templateOptions = [
            {
                label: "Template 1",
                value: "Template Body"
            },
            {
                label: "Template 2",
                value: "Template Body"
            },
            {
                label: "Template 10",
                value: "Template Body"
            }
        ];
        const selectedTemplate = null;

        expectTemplatesSelector(templateOptions, selectedTemplate);
        const res = await getUserTemplateSelection(dialogHandle, "body");
        testExpectedCalls(joplin.commands.execute, 1);
        expect(res).toEqual(null);
    });
});
