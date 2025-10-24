import joplin from "api";
import { fetchAllItems } from "./dataApi";
import { Note } from "./templates";
import { encode } from "html-entities";

export interface Folder {
    id: string;
    title: string;
}

type FolderProperty = "id" | "title";

export const getSelectedFolder = async (): Promise<string> => {
    const folder = await joplin.workspace.selectedFolder();
    return folder.id;
}

export const getFolderFromId = async (folderId: string | null): Promise<Folder | null> => {
    if (!folderId) {
        return null;
    }

    try {
        return await joplin.data.get([ "folders", folderId ], { fields: ["id", "title"] });
    } catch (error) {
        console.error("There was an error loading a folder from id", error);
        return null;
    }
}

export const createFolder = async (title: string): Promise<string> => {
    const folder = await joplin.data.post(["folders"], null, { title: title });
    return folder.id;
}

export const getAllNotesInFolder = async (title: string): Promise<Note[]> => {
    return await fetchAllItems(["search"], { query: `notebook:${title}`, fields: ["id", "title", "body"]})
}

export const doesFolderExist = async (folderId: string): Promise<boolean> => {
    try {
        await joplin.data.get([ "folders", folderId ], { fields: ["title"] });
        return true;
    } catch (error) {
        return false;
    }
};

const getAllFolders = async (): Promise<Folder[]> => {
    return (await fetchAllItems(["folders"], { fields: ["id", "title"] })).map(rawFolder => {
        return {
            id: rawFolder.id,
            title: rawFolder.title,
        }
    });
}

export async function getUserFolderSelection(dialogHandle: string, returnField: "id" | "folder" = "folder", prompt?: string): Promise<string | null> {
    try {
        const folders = await getAllFolders();
        
        if (folders.length === 0) {
            await joplin.views.dialogs.showMessageBox('No notebooks found.');
            return null;
        }

        await joplin.views.dialogs.addScript(dialogHandle, "./views/webview.css");

        const optionsHtml = folders.map(folder => {
            const value = returnField === "id" ? folder.id : JSON.stringify(folder);
            return `<option value="${encode(value)}">${encode(folder.title)}</option>`;
        }).join("");

        await joplin.views.dialogs.setHtml(dialogHandle, `
            <h2>${encode(prompt || "Select notebook")}</h2>
            <form class="variablesForm" name="folders-form">
                <div class="variableName">Choose notebook:</div>
                <select name="folder">${optionsHtml}</select>
            </form>
        `);

        // Add buttons to the dialog
        await joplin.views.dialogs.setButtons(dialogHandle, [
            { id: "ok", title: "Select" },
            { id: "cancel", title: "Cancel" }
        ]);

        // Make dialog size adapt to content
        await joplin.views.dialogs.setFitToContent(dialogHandle, true);

        const result = await joplin.views.dialogs.open(dialogHandle);
        
        if (result.id === 'cancel') {
            return null;
        }

        // Get the folder value from the nested form data structure
        const folderValue = result.formData?.['folders-form']?.folder;
        
        return folderValue || null;
    } catch (error) {
        console.error('Error in getUserFolderSelection:', error);
        return null;
    }
}
