import joplin from "api";
import { getAllNotesInFolder } from "./folders";
import { getAllNotesWithTag, getAllTagsWithTitle } from "./tags";
import { TemplatesSourceSetting, TemplatesSource } from "../settings/templatesSource";
import { LocaleGlobalSetting } from "../settings/global";

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

    const templatesSource = await TemplatesSourceSetting.get();

    if (templatesSource == TemplatesSource.Tag) {
        const templateTags = await getAllTagsWithTitle("template");

        for (const tag of templateTags) {
            templates = templates.concat(await getAllNotesWithTag(tag.id));
        }
    } else {
        templates = templates.concat(await getAllNotesInFolder("Templates"));
    }

    templates = removeDuplicateTemplates(templates);

    let userLocale: string = await LocaleGlobalSetting.get();
    userLocale = userLocale.split("_").join("-");

    templates.sort((a, b) => {
        return a.title.localeCompare(b.title, [userLocale, "en-US"], { sensitivity: "accent", numeric: true });
    });

    return templates;
}

export async function getUserTemplateSelection(dialogHandle: string, returnField: "id" | "note" | "body" = "note", prompt?: string): Promise<string | null> {
    try {
        const version = await joplin.versionInfo();
        const templates = await getAllTemplates();
        
        if (templates.length === 0) {
            await joplin.views.dialogs.showMessageBox('No templates found. Please create some templates first.');
            return null;
        }

        const templateOptions = templates.map(template => `
            <option value="${returnField === "id" ? template.id : JSON.stringify(template)}">
                ${template.title}
            </option>
        `).join('');

        await joplin.views.dialogs.setHtml(dialogHandle, `
            <form name="select-template">
                <div style="padding: 10px;">
                    <label for="template">${prompt || "Select template:"}</label><br/>
                    <select name="template" id="template" style="width: 100%; margin-top: 10px;">
                        ${templateOptions}
                    </select>
                </div>
            </form>
        `);

        const result = await joplin.views.dialogs.open(dialogHandle);
        return result.formData?.template || null;
    } catch (error) {
        console.error("Error getting user template selection", error);
        return null;
    }
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
