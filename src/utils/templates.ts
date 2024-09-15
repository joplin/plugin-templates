import joplin from "api";
import { getAllNotesInFolder } from "./folders";
import { getAllNotesWithTag, getAllTagsWithTitle } from "./tags";

export interface Note {
    id: string;
    title: string;
    body: string;
}

export interface DefaultTemplatesConfigSetting {
    [notebookId: string]: {
        defaultNoteTemplateId: string | null;
        defaultTodoTemplateId: string | null;
    }
}

export enum DefaultTemplateType {
    Both,
    Note,
    Todo,
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

export const getUserTemplateSelection = async (property?: NoteProperty, promptLabel = "Template:"): Promise<string | null> => {
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
        label: promptLabel,
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

export const getUserDefaultTemplateTypeSelection = async (promptLabel = "Applicable for:"): Promise<DefaultTemplateType | null> => {
    const defaultTypeOptions = [
        {
            label: "Both notes & todos",
            value: DefaultTemplateType.Both
        },
        {
            label: "Notes",
            value: DefaultTemplateType.Note
        },
        {
            label: "Todos",
            value: DefaultTemplateType.Todo
        },
    ];

    const { answer } = await joplin.commands.execute("showPrompt", {
        label: promptLabel,
        inputType: "dropdown",
        value: defaultTypeOptions[0],
        autocomplete: defaultTypeOptions
    });

    if (!answer) return null;
    return answer.value;
}

export const setDefaultTemplate = async (notebookId: string | null, templateId: string, defaultType: DefaultTemplateType): Promise<void> => {
    if (notebookId === null) {
        // Global default
        switch (defaultType) {
            case DefaultTemplateType.Note:
                await joplin.settings.setValue("defaultNoteTemplateId", templateId);
                break;
            case DefaultTemplateType.Todo:
                await joplin.settings.setValue("defaultTodoTemplateId", templateId);
                break;
            case DefaultTemplateType.Both:
                await joplin.settings.setValue("defaultNoteTemplateId", templateId);
                await joplin.settings.setValue("defaultTodoTemplateId", templateId);
                break;
            default:
                break;
        }
    } else {
        // Notebook specific default
        let defaultTemplatesConfig: DefaultTemplatesConfigSetting | null = await joplin.settings.value("defaultTemplatesConfig");
        if (defaultTemplatesConfig === null) defaultTemplatesConfig = {};

        if (!(notebookId in defaultTemplatesConfig)) {
            defaultTemplatesConfig[notebookId] = {
                defaultNoteTemplateId: null,
                defaultTodoTemplateId: null
            };
        }

        switch (defaultType) {
            case DefaultTemplateType.Note:
                defaultTemplatesConfig[notebookId].defaultNoteTemplateId = templateId;
                break;
            case DefaultTemplateType.Todo:
                defaultTemplatesConfig[notebookId].defaultTodoTemplateId = templateId;
                break;
            case DefaultTemplateType.Both:
                defaultTemplatesConfig[notebookId].defaultNoteTemplateId = templateId;
                defaultTemplatesConfig[notebookId].defaultTodoTemplateId = templateId;
                break;
            default:
                break;
        }

        await joplin.settings.setValue("defaultTemplatesConfig", defaultTemplatesConfig);
    }
}
