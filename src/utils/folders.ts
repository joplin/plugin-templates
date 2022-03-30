import joplin from "api";
import { fetchAllItems } from "./dataApi";
import { Note } from "./templates";

export const getSelectedFolder = async (): Promise<string> => {
    const folder = await joplin.workspace.selectedFolder();
    return folder.id;
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
