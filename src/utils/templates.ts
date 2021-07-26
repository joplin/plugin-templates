import joplin from "api";
import { doesFolderExist, getAllNotesInFolder, Note } from "./folders";
import { getAllNotesWithTag, getTagWithTitle } from "./tags";

type NoteProperty = "body" | "id" | "title";

export const getTemplatesFolderId = async (): Promise<string> => {
    const templatesFolderId = await joplin.settings.value("templatesFolderId");

    if (templatesFolderId == null || !(await doesFolderExist(templatesFolderId))) {
        const folder = await joplin.data.post(["folders"], null, { title: "Templates" });
        await joplin.settings.setValue("templatesFolderId", folder.id);
        return folder.id;
    }

    return templatesFolderId;
}

const removeDuplicateTemplates = (templates: Note[]) => {
    const uniqueTemplates: Note[] = [];
    const templateIds: string[] = [];

    templates.forEach(note => {
        if (!templateIds.includes(note.id)) {
            templateIds.push(note.id);
            uniqueTemplates.push(note);
        }
    });

    return uniqueTemplates;
}

const getAllTemplates = async (folderId: string) => {
    let templates: Note[] = [];

    try {
        templates = templates.concat(await getAllNotesInFolder(folderId));
    } catch (err) {
        console.error("There was some error in fetching notes in templates folder.", err);
    }

    try {
        const templateTag = await getTagWithTitle("template");
        if (templateTag) {
            templates = templates.concat(await getAllNotesWithTag(templateTag.id));
        }
    } catch (err) {
        console.error("There was some error in fetching notes with template tag.", err);
    }

    return removeDuplicateTemplates(templates);
}

export const getUserTemplateSelection = async (templatesFolderId: string, property?: NoteProperty): Promise<string | null> => {
    const templates = await getAllTemplates(templatesFolderId);
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
