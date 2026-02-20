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

interface NotebookData {
    id: string;
    title: string;
    body: string;
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

const setNotebookTemplates = (notes: NotebookData[]) => {
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
    });

    describe("Tag-based template sourcing", () => {
        beforeEach(() => {
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
    });

    describe("Notebook-based template sourcing", () => {
        beforeEach(() => {
            mockTemplateSourceSetting(TemplatesSource.Notebook);
        });

        test("should show a dialog when there are no notebook templates", async () => {
            setNotebookTemplates([]);
            const selectedTemplate = await getUserTemplateSelection(dialogHandle);
            testExpectedCalls(joplin.views.dialogs.showMessageBox, 1);
            expect(selectedTemplate).toBeNull();
        });

        test("should show selector correctly when notebook templates exist", async () => {
            const notebookTemplates = [
                {
                    id: "note-id-1",
                    title: "Meeting Template",
                    body: "# Meeting Notes\n\n## Agenda\n\n## Action Items"
                },
                {
                    id: "note-id-2",
                    title: "Daily Journal",
                    body: "# {{date}}\n\n## Today's Goals\n\n## Reflections"
                }
            ];

            setNotebookTemplates(notebookTemplates);

            const selectedNote = notebookTemplates[0];
            const selectedTemplateValue = encode(JSON.stringify(selectedNote));

            expectTemplatesDialog(selectedTemplateValue);
            const res = await getUserTemplateSelection(dialogHandle);
            testExpectedCalls(joplin.views.dialogs.open, 1);
            expect(res).toEqual(JSON.stringify(selectedNote));
        });

        test("should return null if no notebook template is selected", async () => {
            const notebookTemplates = [
                {
                    id: "note-id-1",
                    title: "Meeting Template",
                    body: "# Meeting Notes"
                }
            ];

            setNotebookTemplates(notebookTemplates);
            expectTemplatesDialog(null);
            const res = await getUserTemplateSelection(dialogHandle);
            testExpectedCalls(joplin.views.dialogs.open, 1);
            expect(res).toBeNull();
        });

        test("should return a single property if noteProperty is defined for notebook templates", async () => {
            const notebookTemplates = [
                {
                    id: "note-id-1",
                    title: "Meeting Template",
                    body: "# Meeting Notes\n\n## Agenda"
                }
            ];

            setNotebookTemplates(notebookTemplates);
            const selectedTemplateValue = encode("# Meeting Notes\n\n## Agenda");

            expectTemplatesDialog(selectedTemplateValue);
            const res = await getUserTemplateSelection(dialogHandle, "body");
            testExpectedCalls(joplin.views.dialogs.open, 1);
            expect(res).toEqual("# Meeting Notes\n\n## Agenda");
        });

        test("should sort notebook templates correctly", async () => {
            const notebookTemplates = [
                {
                    id: "note-id-1",
                    title: "Template 1",
                    body: "Body 1"
                },
                {
                    id: "note-id-10",
                    title: "Template 10",
                    body: "Body 10"
                },
                {
                    id: "note-id-2",
                    title: "Template 2",
                    body: "Body 2"
                }
            ];

            setNotebookTemplates(notebookTemplates);
            expectTemplatesDialog(null);
            const res = await getUserTemplateSelection(dialogHandle);
            testExpectedCalls(joplin.views.dialogs.open, 1);
            expect(res).toBeNull();
        });

        test("should remove duplicate templates from notebook", async () => {
            const notebookTemplates = [
                {
                    id: "note-id-1",
                    title: "Template 1",
                    body: "Body 1"
                },
                {
                    id: "note-id-1", // Duplicate ID
                    title: "Template 1 Duplicate",
                    body: "Body 1 Duplicate"
                },
                {
                    id: "note-id-2",
                    title: "Template 2",
                    body: "Body 2"
                }
            ];

            setNotebookTemplates(notebookTemplates);

            const selectedNote = {
                id: "note-id-1",
                title: "Template 1",
                body: "Body 1"
            };
            const selectedTemplateValue = encode(JSON.stringify(selectedNote));

            expectTemplatesDialog(selectedTemplateValue);
            const res = await getUserTemplateSelection(dialogHandle);
            testExpectedCalls(joplin.views.dialogs.open, 1);
            expect(res).toEqual(JSON.stringify(selectedNote));
        });

        test("should handle notebook templates with special characters in titles", async () => {
            const notebookTemplates = [
                {
                    id: "note-id-1",
                    title: "Template with <special> & \"characters\"",
                    body: "Body with <html> & entities"
                }
            ];

            setNotebookTemplates(notebookTemplates);

            const selectedNote = notebookTemplates[0];
            const selectedTemplateValue = encode(JSON.stringify(selectedNote));

            expectTemplatesDialog(selectedTemplateValue);
            const res = await getUserTemplateSelection(dialogHandle);
            testExpectedCalls(joplin.views.dialogs.open, 1);
            expect(res).toEqual(JSON.stringify(selectedNote));
        });

        test("should call getAllNotesInFolder with 'Templates' folder name", async () => {
            const getAllNotesInFolderSpy = jest.spyOn(folderUtils, "getAllNotesInFolder");
            setNotebookTemplates([]);

            await getUserTemplateSelection(dialogHandle);

            expect(getAllNotesInFolderSpy).toHaveBeenCalledWith("Templates");
            expect(getAllNotesInFolderSpy).toHaveBeenCalledTimes(1);
        });

        test("should not call tag-related functions when using notebook source", async () => {
            const getAllTagsWithTitleSpy = jest.spyOn(tagUtils, "getAllTagsWithTitle");
            const getAllNotesWithTagSpy = jest.spyOn(tagUtils, "getAllNotesWithTag");

            setNotebookTemplates([
                {
                    id: "note-id-1",
                    title: "Template 1",
                    body: "Body 1"
                }
            ]);

            expectTemplatesDialog(null);
            await getUserTemplateSelection(dialogHandle);

            expect(getAllTagsWithTitleSpy).not.toHaveBeenCalled();
            expect(getAllNotesWithTagSpy).not.toHaveBeenCalled();
        });
    });
});
