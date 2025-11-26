import joplin from "api";
import { getAllNotesInFolder } from "./folders";
import { getAllNotesWithTag, getAllTagsWithTitle } from "./tags";
import { TemplatesSourceSetting, TemplatesSource } from "../settings/templatesSource";
import { LocaleGlobalSetting } from "../settings/global";
import { encode, decode } from "html-entities";
import { AUTO_FOCUS_SCRIPT } from "./dialogHelpers";

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

export async function getUserTemplateSelection(dialogHandle: string, property?: NoteProperty, promptLabel = "Template:"): Promise<string | null> {
    try {
        const templates = await getAllTemplates();
        
        if (templates.length === 0) {
            await joplin.views.dialogs.showMessageBox("No templates found! Please create a template and try again.");
            return null;
        }

        await joplin.views.dialogs.addScript(dialogHandle, "./views/webview.css");

        const optionsHtml = templates.map(note => {
            let optionValue;
            if (!property) {
                optionValue = JSON.stringify(note);
            } else {
                optionValue = note[property];
            }
            return `<option value="${encode(optionValue)}">${encode(note.title)}</option>`;
        }).join("");

        await joplin.views.dialogs.setHtml(dialogHandle, `
            <h2>${encode(promptLabel)}</h2>
            <form class="variablesForm" name="templates-form">
                <div class="variableName">Select a template:</div>
                <select name="template" id="autofocus-target">${optionsHtml}</select>
            </form>
            ${AUTO_FOCUS_SCRIPT}
        `);

        // Add buttons to the dialog
        await joplin.views.dialogs.setButtons(dialogHandle, [
            { id: "ok", title: "Select", default: true },
            { id: "cancel", title: "Cancel" }
        ]);

        // Make dialog size adapt to content
        await joplin.views.dialogs.setFitToContent(dialogHandle, true);

        const result = await joplin.views.dialogs.open(dialogHandle);
        
        if (result.id === "cancel") {
            return null;
        }
        
        // Get the template value and decode HTML entities
        const templateValue = result.formData?.["templates-form"]?.template;
        const decodedValue = templateValue ? decode(templateValue) : null;
        
        return decodedValue;
    } catch (error) {
        console.error("Error in getUserTemplateSelection:", error);
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
