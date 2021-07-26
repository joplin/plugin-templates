import joplin from "api";
import { doesFolderExist, getAllNotesInFolder, Note } from "./folders";
import { getAllNotesWithTag, getTagWithTitle } from "./tags";
import { setTemplatesFolderView } from "../views/templatesFolder";

type NoteProperty = "body" | "id" | "title";
const WELCOME_MESSAGE = (
    `Thanks for downloading the templates plugin. This plugin allows you to create and use templates in the Joplin desktop application. Please read the following instructions very carefully to get started.

    1. You can see the menu for this plugin under the tools category in the menu bar. To read the complete plugin documentation you can click on the help option in the menu itself.
    2. To use this plugin it is mandatory to have a templates notebook i.e. a notebook dedicated to storing templates. After you close this popup you'll be presented with another dialog to select or create a new templates notebook.
    3. If you used the native templates feature, your templates will be automatically loaded by this plugin into your templates notebook.`
);

export const getTemplatesFolderId = async (dialogViewHandle: string, changeFolder = false): Promise<string> => {
    const templatesFolderId = await joplin.settings.value("templatesFolderId");

    if (templatesFolderId == null || !(await doesFolderExist(templatesFolderId)) || changeFolder) {
        if (!changeFolder) await joplin.views.dialogs.showMessageBox(WELCOME_MESSAGE);

        await setTemplatesFolderView(dialogViewHandle);
        const dialogResponse = await joplin.views.dialogs.open(dialogViewHandle);

        const newTemplatesFolderId = dialogResponse.formData.folders.folder;

        if (newTemplatesFolderId === "new") {
            const folder = await joplin.data.post(["folders"], null, { title: "Templates" });
            await joplin.settings.setValue("templatesFolderId", folder.id);
            return folder.id;
        }

        await joplin.settings.setValue("templatesFolderId", newTemplatesFolderId);
        return newTemplatesFolderId;
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
