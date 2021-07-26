import joplin from "api";
import { getAllNotesInFolder, Note } from "./folders";

type NoteProperty = "body" | "id" | "title";

export const getUserTemplateSelection = async (templatesFolderId: string, property?: NoteProperty): Promise<string | null> => {
    const templates = await getAllNotesInFolder(templatesFolderId);
    const templateOptions = templates.map(note => {
        let optionValue;

        if (!property) {
            optionValue = JSON.stringify(note);
        } else {
            optionValue = note[property];
        }

        return {
            label: note.title,
            value: optionValue
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
        console.error("There was an error loading a template from id", error);
        return null;
    }
}
