import joplin from "api";
import { getAllNotesInFolder } from "./folders";
import { getAllNotesWithTag, getAllTagsWithTitle } from "./tags";
import { TemplatesSourceSetting, TemplatesSource } from "../settings/templatesSource";
import { LocaleGlobalSetting } from "../settings/global";
import { encode, decode } from "html-entities";
import { AUTO_FOCUS_SCRIPT } from "./dialogHelpers";
import { fetchAllItems } from "./dataApi";

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

        const optionsHtml = templates
            .filter(note => note && note.id && note.title)
            .map(note => {
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
            { id: "ok", title: "Select" },
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

/**
 * Checks whether a given note still has the 'template' tag.
 * Returns false if the note has no template tag or if the check fails.
 */
export const isNoteATemplate = async (noteId: string): Promise<boolean> => {
    try {
        const tags = await fetchAllItems(["notes", noteId, "tags"], { fields: ["id", "title"] });
        return tags.some((tag: { title: string }) => tag.title === "template");
    } catch (error) {
        console.error("Error checking if note is a template", error);
        return false;
    }
};

export const getTemplateFromId = async (templateId: string | null): Promise<Note | null> => {
    if (!templateId) {
        return null;
    }

    try {
        const note = await joplin.data.get(["notes", templateId], { fields: ["id", "title", "body"] });

        const stillATemplate = await isNoteATemplate(templateId);
        if (!stillATemplate) {
            console.warn(`Note "${note.title}" (id: ${templateId}) is set as a default template but no longer has the 'template' tag.`);
            return null;
        }

        return note;
    } catch (error) {
        console.error("There was an error loading a template from id", error);
        return null;
    }
}
