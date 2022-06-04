import joplin from "api";
import { getAllNotesInFolder } from "./folders";
import { getAllNotesWithTag, getAllTagsWithTitle } from "./tags";

export interface Note {
    id: string;
    title: string;
    body: string;
}

type NoteProperty = "body" | "id" | "title";

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

const getAllTemplates = async () => {
    let templates: Note[] = [];

    const templatesSource = await joplin.settings.value("templatesSource");

    if (templatesSource == "tag"){
        const templateTags = await getAllTagsWithTitle("template");

        for (const tag of templateTags) {
            templates = templates.concat(await getAllNotesWithTag(tag.id));
        }
    } else {
        templates = templates.concat(await getAllNotesInFolder("Templates"));
    }

    templates = removeDuplicateTemplates(templates);

    let userLocale: string = await joplin.settings.globalValue("locale");
    userLocale = userLocale.split("_").join("-");

    templates.sort((a, b) => {
        return a.title.localeCompare(b.title, [userLocale, "en-US"], { sensitivity: "accent", numeric: true });
    });

    return templates;
}

export const getUserTemplateSelection = async (property?: NoteProperty): Promise<string | null> => {
    const templates = await getAllTemplates();
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
