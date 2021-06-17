import joplin from "api";
import { getAllNotesInFolder } from "./folders";

export const getUserTempateSelection = async (templatesFolderId: string): Promise<string | null> => {
    const templates = await getAllNotesInFolder(templatesFolderId);
    const templateOptions = templates.map(note => {
        return {
            label: note.title,
            value: note.body
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
