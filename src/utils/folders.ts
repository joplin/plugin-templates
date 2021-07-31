import joplin from "api";
import { fetchAllItems } from "./dataApi";
import { Note } from "./templates";

export const doesFolderExist = async (folderId: string): Promise<boolean> => {
    try {
        await joplin.data.get([ "folders", folderId ], { fields: ["title"] });
        return true;
    } catch (error) {
        return false;
    }
};

export const getAllNotesInFolder = async (folderId: string): Promise<Note[]> => {
    return fetchAllItems(["folders", folderId, "notes"], { fields: ["id", "title", "body"] });
}
