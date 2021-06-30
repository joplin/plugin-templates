import joplin from "api";
import { getAllNotesInFolder, Note } from "./folders";

type NoteProperty = "body" | "id" | "title";

export const getUserTempateSelection = async (templatesFolderId: string, property: NoteProperty = "body"): Promise<string | null> => {
    const templates = await getAllNotesInFolder(templatesFolderId);
    const templateOptions = templates.map(note => {
        return {
            label: note.title,
            value: note[property]
        };
    });

    if (!templateOptions.length) {
        await joplin.views.dialogs.showMessageBox("No templates found! Please create a template and try again.");
        return null;
    }

    const { answer } = await joplin.commands.execute("showPrompt", {
        label: "Template:",
        inputType: "dropdown",
        value: templateOptions[0],
        autocomplete: templateOptions
    });

    if (answer) {
        return answer.value;
    }

    return null;
}

export const getTemplateFromId = async (templateId: string | null): Promise<Note | null> => {
    if (!templateId) {
        return null;
    }

    try {
        return await joplin.data.get([ "notes", templateId ], { fields: ["id", "title", "body"] });
    } catch (error) {
        return null;
    }
}
