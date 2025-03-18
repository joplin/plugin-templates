import joplin from "api";
import { fetchAllItems } from "./dataApi";
import { Note } from "./templates";

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

        await joplin.views.dialogs.setHtml(dialogHandle, `
            <div style="padding: 10px;">
                <p>${prompt || "Select notebook:"}</p>
                <select id="folder" name="folder">
                    ${folders.map(folder => `
                        <option value='${returnField === "id" ? folder.id : JSON.stringify(folder)}'>
                            ${folder.title}
                        </option>
                    `).join('')}
                </select>
            </div>
        `);

        const result = await joplin.views.dialogs.open(dialogHandle);
        return result.formData?.folder || null;
    } catch (error) {
        console.error('Error in getUserFolderSelection:', error);
        return null;
    }
}
