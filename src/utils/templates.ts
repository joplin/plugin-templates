import joplin from "api";
import { getAllNotesInFolder } from "./folders";
import { getAllNotesWithTag, getAllTagsWithTitle } from "./tags";
import { TemplatesSourceSetting, TemplatesSource } from "../settings/templatesSource";
import { LocaleGlobalSetting } from "../settings/global";
import { encode, decode } from "html-entities";
import { AUTO_FOCUS_SCRIPT } from "./dialogHelpers";

// Can't use import for this library because the types in the library
// are declared incorrectly which result in typescript errors.
// Reference -> https://github.com/jxson/front-matter/issues/76
// eslint-disable-next-line @typescript-eslint/no-var-requires
const frontmatter = require("front-matter");

export interface Note {
    id: string;
    title: string;
    body: string;
}

interface TemplateWithOrder extends Note {
    order?: number;
}

type NoteProperty = "body" | "id" | "title";

const extractOrderFromTemplate = (template: Note): number | undefined => {
    try {
        const processedTemplate = frontmatter(template.body);
        const order = processedTemplate.attributes?.order;
        
        if (order !== undefined && order !== null) {
            const numericOrder = Number(order);
            if (!isNaN(numericOrder)) {
                return numericOrder;
            }
        }
    } catch (error) {
        // If front-matter parsing fails, ignore and return undefined
        // This ensures backward compatibility with templates that don't use front-matter
    }
    
    return undefined;
};

const sortTemplates = (templates: Note[], userLocale: string): Note[] => {
    // Extract order metadata for each template
    const templatesWithOrder: TemplateWithOrder[] = templates.map(template => ({
        ...template,
        order: extractOrderFromTemplate(template)
    }));

    // Sort templates with custom logic
    return templatesWithOrder.sort((a, b) => {
        const aHasOrder = a.order !== undefined;
        const bHasOrder = b.order !== undefined;

        // If both have order, sort by order (ascending), then by title
        if (aHasOrder && bHasOrder) {
            if (a.order !== b.order) {
                return (a.order as number) - (b.order as number);
            }
            // Same order, fallback to alphabetical
            return a.title.localeCompare(b.title, [userLocale, "en-US"], { sensitivity: "accent", numeric: true });
        }

        // If only one has order, prioritize the one with order
        if (aHasOrder && !bHasOrder) {
            return -1;
        }
        if (!aHasOrder && bHasOrder) {
            return 1;
        }

        // If neither has order, sort alphabetically (existing behavior)
        return a.title.localeCompare(b.title, [userLocale, "en-US"], { sensitivity: "accent", numeric: true });
    });
};

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

    templates = sortTemplates(templates, userLocale);

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
